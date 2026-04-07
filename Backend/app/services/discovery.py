import os
from googleapiclient.discovery import build

class ContentDiscovery:
    def __init__(self, api_key: str = "YOUR_YOUTUBE_API_KEY"):
        self.api_key = api_key
        try:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        except Exception as e:
            print(f"YouTube Service Error: {e}")
            self.youtube = None

    def fetch_learning_stack(self, query: str):
        if not self.youtube:
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
            print(f"Discovery Error: {e}")
            return []