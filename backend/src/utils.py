from groq import Groq
import base64
from typing import Optional

# Initialize Groq client
# client = Groq()

def analyze_image_with_langchain(base64_image, llm, prompt: str = "What's in this image?") -> Optional[str]:
    """
    Analyzes an image using LangChain's integration with Groq's vision model.

    :param image_path: Path to the image file.
    :param prompt: Instruction for AI to analyze the image.
    :return: AI-generated response describing the image.
    """
    try:

        # Construct the message format expected by Groq's vision model
        messages = [
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                }
            ]}
        ]

        # Invoke the model using LangChain
        response = llm.invoke(messages)

        return response if response else None

    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None
