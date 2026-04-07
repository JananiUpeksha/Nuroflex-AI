import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Path-safe loading: This looks for .env in the current directory
load_dotenv()

class ContentDiscovery:
    def __init__(self):
        # Fetch the key from the environment
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        
        if not self.api_key:
            print("❌ ERROR: YOUTUBE_API_KEY is missing from .env file!")
            self.youtube = None
        else:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.api_key)
                print("✅ YouTube Service Initialized Successfully")
            except Exception as e:
                print(f"❌ YouTube Service Init Error: {e}")
                self.youtube = None

    def fetch_learning_stack(self, query: str):
        if not self.youtube:
            print(f"⚠️ Skipping search for '{query}' - YouTube service unavailable")
            return []
        try:
            request = self.youtube.search().list(
                q=f"{query} educational math tutorial",
                part="snippet",
                type="video",
                maxResults=3,
                videoEmbeddable='true'
            )
            response = request.execute()
            stack = []
            if response.get('items'):
                for item in response['items']:
                    stack.append({
                        "video_id": item['id']['videoId'],
                        "title": item['snippet']['title'],
                        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                    })
            return stack
        except Exception as e:
            print(f"❌ YouTube API Fetch Error for '{query}': {e}")
            return []