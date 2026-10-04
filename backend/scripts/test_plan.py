import asyncio

from dotenv import load_dotenv

load_dotenv()

from app.services.agent_service import create_plan


async def main() -> None:
    result = await create_plan(
        "I'm in Ahmedabad. I have 2000 for 4 people. "
        "I want a fun Saturday evening with dinner and an activity."
    )
    print("plan items:", len(result.plan))
    print("requirements:", result.requirements.model_dump())
    for item in result.plan:
        print("-", item.type, item.name, item.estimated_cost)
    print("summary:", result.summary[:300])
    print("warnings:", result.warnings)


if __name__ == "__main__":
    asyncio.run(main())
