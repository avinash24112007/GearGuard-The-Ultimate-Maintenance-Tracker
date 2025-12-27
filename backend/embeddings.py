import os
import random
# from openai import OpenAI # Uncomment if using real OpenAI

# Simple Mock Embedding Service to allow running without API keys immediately
# Replace with real implementation for production

class EmbeddingService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        # self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.dimension = 1536

    def get_embedding(self, text: str):
        """
        Generates a vector embedding for the given text.
        """
        if not text:
            return [0.0] * self.dimension

        # REAL IMPLEMENTATION EXAMPLE:
        # if self.client:
        #     response = self.client.embeddings.create(
        #         input=text,
        #         model="text-embedding-3-small"
        #     )
        #     return response.data[0].embedding
        
        # MOCK IMPLEMENTATION (Random vector for demo purposes):
        print(f"Generating mock embedding for: {text[:30]}...")
        return [random.random() for _ in range(self.dimension)]

embedding_service = EmbeddingService()
