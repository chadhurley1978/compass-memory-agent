import json
import openai
import os
from supermemory_openai import SupermemoryTools, execute_memory_tool_calls

def handler(request):
    try:
        if request.method != "POST":
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method not allowed"})
            }

        body = request.get_json()
        message = body.get("message", "")

        if not message:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Message is required"})
            }

        openai.api_key = os.environ["OPENAI_API_KEY"]
        tools = SupermemoryTools(
            api_key=os.environ["SUPERMEMORY_API_KEY"],
            config={"project_id": os.environ["PROJECT_ID"]}
        )

        messages = [
            {"role": "system", "content": "You are Compass, the assistant with memory."},
            {"role": "user", "content": message}
        ]

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=messages,
            tools=tools.get_tool_definitions()
        )

        tool_calls = response["choices"][0]["message"].get("tool_calls")
        if tool_calls:
            tool_results = execute_memory_tool_calls(
                api_key=os.environ["SUPERMEMORY_API_KEY"],
                tool_calls=tool_calls,
                config={"project_id": os.environ["PROJECT_ID"]}
            )
            messages.append(response["choices"][0]["message"])
            messages.extend(tool_results)
            follow_up = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=messages
            )
            return {
                "statusCode": 200,
                "body": json.dumps({"response": follow_up["choices"][0]["message"]["content"]})
            }

        return {
            "statusCode": 200,
            "body": json.dumps({"response": response["choices"][0]["message"]["content"]})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
