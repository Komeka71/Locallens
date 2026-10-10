# 🧭 LocalLens

## Stop guessing where to go. Get a plan built on real places.

LocalLens is an **AI-powered local discovery and outing planner** that helps people turn a simple idea into a practical outing plan.

Instead of searching through multiple websites for restaurants, cafés, activities, ratings, opening hours, prices, and reviews, users can simply describe what they want in natural language.

For example:

> "I'm in Ahmedabad. I have ₹600 for 2 people. A calm cafe with good coffee where we can talk."

Or:

> "I'm in Ahmedabad. I have ₹4000 for 5 people including 2 kids. Sunday lunch plus a kid-friendly activity."

LocalLens understands the user's requirements, retrieves relevant local search results using **SerpApi**, and uses **Google Gemini** for AI-assisted planning.

The idea is simple:

> **Tell LocalLens what kind of outing you want. Let it help you figure out where to go.**

---

# 🌟 Why LocalLens?

Planning an outing sounds easy until you actually have to do it.

You may have to:

- Search for places
- Compare ratings
- Check opening hours
- Look at prices
- Find nearby activities
- Consider your budget
- Consider the number of people
- Check whether a place is suitable for children
- Compare several options
- Finally build the actual plan yourself

The information exists, but it is scattered across different platforms.

At the same time, asking a generic AI assistant for recommendations has another problem:

> The AI may know about a place, but that does not necessarily mean the information is current.

LocalLens combines both sides:

```text
        USER INTENT
             ↓
    Natural-language request
             ↓
      AI understanding
             ↓
       Live local search
          SerpApi
             ↓
      Relevant real places
             ↓
      AI-assisted planning
          Gemini
             ↓
       Structured plan
