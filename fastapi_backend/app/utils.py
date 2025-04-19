from langchain_core.messages import HumanMessage, AIMessage

def convert_to_langchain_messages(history):
    messages = []
    for msg in history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            messages.append(AIMessage(content=msg.content))
    return messages
