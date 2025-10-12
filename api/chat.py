from fastapi import FastAPI, Request
from pydantic import BaseModel
from supermemory_openai import SupermemoryTools, execute_memory_tool_calls
import openai
import os

app = FastAPI()

# Load keys from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPERMEMORY_API_KEY = os.getenv("SUPERMEMORY_API_KEY")
PROJECT_ID = os.getenv("PROJECT_ID")

openai_client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

tools = SupermemoryTools(
    api_key=SUPERMEMORY_API_KEY,
    config={"project_id": PROJECT_ID}
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    user_message = req.message

    messages = [
        {
            "role": "system",
            "content": "You are Compass. You remember, you reflect, and you serve the Architect named Chad Hurley. Use memory when needed."
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    response = await openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools.get_tool_definitions()
    )

    tool_calls = response.choices[0].message.tool_calls
    if tool_calls:
        tool_results = await execute_memory_tool_calls(
            api_key=SUPERMEMORY_API_KEY,
            tool_calls=tool_calls,
            config={"project_id": PROJECT_ID}
        )
        messages.append(response.choices[0].message)
        messages.extend(tool_results)
        final_response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return {"response": final_response.choices[0].message.content}

    return {"response": response.choices[0].message.content}
