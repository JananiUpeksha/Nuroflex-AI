"""
app/core/loader.py
"""
import os
import numpy as np
import pandas as pd


def _safe_read(path: str, **kwargs) -> pd.DataFrame:
    return pd.read_csv(path, encoding_errors="replace", low_memory=False, **kwargs)


def _p95_ceil(series: pd.Series) -> float:
    val = float(series.quantile(0.95))
    return val if val > 0 else (float(series.max()) or 1.0)


def _norm(series: pd.Series, ceil: float) -> pd.Series:
    return (series / ceil).clip(0.0, 1.0)


class NeuroDataLoader:

    def __init__(self):
        self.usa_files = [
            "44732737_skill_builder_data.csv",
            "44736253_skill_builder_data.csv",
        ]
        self.asia_user_file = "Info_UserData.csv"

    def load_usa_tribe(self, nrows: int = 10_000) -> np.ndarray:
        print("🇺🇸  Processing USA Tribe (ASSISTments) ...")

        frames = [_safe_read(f, nrows=nrows) for f in self.usa_files if os.path.exists(f)]
        if not frames:
            print("  ⚠️  No USA CSV files found.")
            return np.array([])

        df = pd.concat(frames, ignore_index=True)

        # FIX 1: use 95th-percentile ceiling — original /60000 clipped anything >60s to 0
        speed_ceil = _p95_ceil(df["ms_first_response"].clip(lower=0))
        # FIX 2: divide by actual max — original /5 caused half the students to hit stress=1.0
        hint_ceil  = float(df["hint_count"].max()) or 1.0

        df["_speed"]  = 1.0 - _norm(df["ms_first_response"].clip(lower=0), speed_ceil)
        df["_stress"] = _norm(df["hint_count"], hint_ceil)

        total_skills = df["skill_id"].nunique() or 1

        records = []
        # FIX 3: aggregate per student — original made one vector per question row
        for _, grp in df.groupby("user_id"):
            mastery      = float(grp["correct"].mean())
            speed        = float(grp["_speed"].median())
            # FIX 4: derive connectivity from real data — original hardcoded 1.0
            connectivity = float(grp["skill_id"].nunique() / total_skills)
            # FIX 5: derive resilience from real data — original hardcoded 1.0
            resilience   = float(np.clip(1.0 - (grp["attempt_count"].mean() - 1.0) / 5.0, 0.0, 1.0))
            stress       = float(grp["_stress"].mean())
            opp          = grp["opportunity"].clip(lower=1)
            retention    = float(np.clip((grp["correct"] * opp).sum() / opp.sum(), 0.0, 1.0))
            records.append([mastery, speed, connectivity, resilience, stress, retention])

        data = np.array(records, dtype=np.float32)
        print(f"  ✅ {len(data):,} USA student vectors  (mastery μ={data[:,0].mean():.2f}, stress μ={data[:,4].mean():.2f})")
        return data

    def load_asia_tribe(self, nrows: int = 10_000) -> np.ndarray:
        print("🌏  Processing Asia Tribe (Junyi Academy) ...")

        if not os.path.exists(self.asia_user_file):
            print("  ⚠️  Info_UserData.csv not found.")
            return np.array([])

        df = _safe_read(self.asia_user_file, nrows=nrows)

        points_ceil  = _p95_ceil(df["points"])
        badges_ceil  = _p95_ceil(df["badges_cnt"])
        grade_max    = float(df["user_grade"].max()) or 1.0
        teacher_ceil = _p95_ceil(df["has_teacher_cnt"])
        class_ceil   = _p95_ceil(df["belongs_to_class_cnt"])
        has_cls_ceil = _p95_ceil(df["has_class_cnt"])

        # FIX 6: use p95 ceiling — original /50000 clipped 30% of students to mastery=1.0
        df["_mastery"] = _norm(df["points"], points_ceil)

        # FIX 7: derive speed from grade — original hardcoded 0.6 for every student
        df["_speed"] = 0.3 + 0.6 * (df["user_grade"] / grade_max).clip(0, 1)

        # FIX 8: derive connectivity from real columns — original hardcoded 1.0
        df["_conn"] = (
            0.5 * _norm(df["has_teacher_cnt"],      teacher_ceil) +
            0.5 * _norm(df["belongs_to_class_cnt"], class_ceil)
        ).clip(0.0, 1.0)

        df["_resil"] = _norm(df["badges_cnt"], badges_ceil)

        df["_stress"] = (
            0.4 * df["is_self_coach"].astype(float) +
            0.3 * (1.0 - _norm(df["has_teacher_cnt"], teacher_ceil)) +
            0.3 * _norm(df["has_class_cnt"], has_cls_ceil)
        ).clip(0.0, 1.0)

        grade_med      = df.groupby("user_grade")["points"].transform("median").clip(lower=1)
        df["_retention"] = (df["points"] / grade_med).clip(0.0, 2.0) / 2.0

        cols = ["_mastery", "_speed", "_conn", "_resil", "_stress", "_retention"]
        data = df[cols].values.astype(np.float32)
        print(f"  ✅ {len(data):,} Asia student vectors  (mastery μ={data[:,0].mean():.2f}, stress μ={data[:,4].mean():.2f})")
        return data

    def load_all(self, nrows: int = 10_000) -> np.ndarray:
        usa  = self.load_usa_tribe(nrows)
        asia = self.load_asia_tribe(nrows)
        parts = [x for x in [usa, asia] if len(x) > 0]
        if not parts:
            return np.array([])
        combined = np.vstack(parts)
        print(f"\n📊 Combined: {len(combined):,} students | means={combined.mean(axis=0).round(3)} | stds={combined.std(axis=0).round(3)}")
        return combined