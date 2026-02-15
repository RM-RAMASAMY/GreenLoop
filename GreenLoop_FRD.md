# Functional Requirements Document (FRD)
**Project Name:** GreenLoop
**Type:** Gamified Climate Habit Engine (Mobile App + Browser Extension)
**Version:** 1.0 (MVP Scope)

---

## 1. Executive Summary
GreenLoop is a cross-platform ecosystem designed to make sustainable living visible, addictive, and social. It unifies offline environmental care (planting/gardening) and online purchasing decisions into a single gamified "Mission" structure.

**The Goal:** To reduce decision fatigue and isolation by rewarding users with visible progress ("GreenPoints" & "Levels") for every climate-positive action.

---

## 2. User Personas
* **The Urban Dweller:** Lives in an apartment, owns 1-2 succulents, wants to be green but lacks space. Needs low-barrier entry.
* **The Eco-Shopper:** Tries to buy sustainable products but gets overwhelmed by researching ingredients. Needs instant guidance.
* **The Competitor:** Motivated by leaderboards and seeing how they stack up against their friends or neighborhood.

---

## 3. Core Gamification Engine (System-Wide)
*This is the logic layer that connects the App and the Extension.*

### 3.1 Point System & Economy
* **Requirement:** The system must utilize a unified currency (e.g., "EcoXP").
* **Scoring Logic:**
    * **Grow Missions:** +10 XP for watering, +50 XP for planting.
    * **Smart Choice Missions:** +20 XP for viewing a swap, +100 XP for purchasing a sustainable alternative.
* **Streaks:** System must track consecutive days of activity. Missing 24 hours resets the multiplier.

### 3.2 Progression
* **Levels:** Users progress through tiers (e.g., Seedling -> Sapling -> Tree -> Forest).
* **Visual Feedback:** The user’s avatar or home screen "garden" must visually evolve as they level up.

---

## 4. Feature Set A: Mobile Application (iOS/Android)
*Focus: Habit tracking, physical world actions, and community.*

### 4.1 Onboarding & "The Garden"
* **User Profile:** Sign up via Email/Social. Location permission (optional) for neighborhood leaderboards.
* **Digital Garden:** The home screen must display a visualization of the user's current level (e.g., a flourishing digital plot).

### 4.2 "Grow" Missions (Plant Tracking)
* **Add Plant:** Users can input a plant nickname and type.
* **Care Schedule:** Users set watering/sunlight frequency.
* **Photo Log:** Users must be able to upload a photo of their plant to verify growth/health (Action = "Log Growth").
* **Notification Engine:** Push notifications for "Thirsty Plant" reminders.

### 4.3 Action Logging (Manual Missions)
* **Quick Log Button:** A prominent "+" button to log standard eco-habits:
    * Refilled water bottle.
    * Composted food waste.
    * Walked instead of drove.

### 4.4 Social Leaderboards
* **Scope:** Leaderboards must toggle between "Friends," "Local Neighborhood" (Geo-fenced), and "Global."
* **Metric:** Ranked by Total EcoXP earned in the current week.

---

## 5. Feature Set B: Chrome/Browser Extension
*Focus: Reduce decision fatigue during online shopping.*

### 5.1 Shopping Detection
* **Trigger:** The extension must detect when the user visits specific URLs (Amazon, Walmart, Target).
* **UI Injection:** A non-intrusive sidebar or overlay must appear only on product detail pages.

### 5.2 "Smart Choice" Analysis
* **Keyword Scanning:** The extension scans the product title/description for "red flag" keywords (e.g., "Palm Oil," "Non-recyclable," "Single-use plastic").
* **Recommendation Engine:** If a red flag is found, the system queries the database for a "Green Swap" (e.g., Plastic toothbrush -> Bamboo toothbrush).

### 5.3 Rewards & Sync
* **Account Link:** Extension must display a QR code for the Mobile App to scan, linking the browser session to the user's mobile account.
* **Action Reward:** Clicking "View Green Alternative" grants instant EcoXP, triggering a notification on the user's phone.

---

## 6. Technical Requirements & Data

### 6.1 Database Schema (Simplified)
| Entity | Key Attributes |
| :--- | :--- |
| **User** | UserID, Email, TotalXP, CurrentLevel, StreakCount |
| **Plant** | PlantID, OwnerID, Type, LastWateredDate, HealthStatus |
| **Product** | ProductID, Category, EcoScore, SwapProductID (Foreign Key) |
| **Transaction** | UserID, ActionType (Plant/Shop), XP_Earned, Timestamp |

### 6.2 APIs
* **OpenFoodFacts / OpenProductData:** To fetch basic sustainability data for the extension (if not hardcoding the MVP).
* **Google/Apple Maps API:** For neighborhood clustering.

---

## 7. Non-Functional Requirements (Constraints)
* **Performance:** The Chrome Extension must load recommendations in under 2 seconds to avoid interrupting the shopping flow.
* **Offline Mode:** The Mobile App must allow logging plant care without internet; data syncs when connection is restored.
* **Privacy:** Shopping data must *not* be stored permanently. Only the metadata required for awarding points (e.g., "Category: Hygiene", "Action: Swap") is saved.

---

## 8. User Stories (MVP Scope)
1.  **As a User,** I want to snap a picture of my basil plant so I can track its growth and earn points for keeping it alive.
2.  **As a Shopper,** I want the browser to automatically tell me if there is a plastic-free version of the item I am looking at so I don't have to search for it.
3.  **As a Competitor,** I want to see if my neighborhood is beating the neighboring district in "Green Score" so I can feel part of a team effort.

---

### **Recommendations for Hackathon Success**
To win the hackathon, **do not build a complex backend for the shopping analysis.**
* **The Hack:** Hardcode a database of 20 common items (e.g., Shampoo, Toothbrush, Water Bottle).
* **The Demo:** Show a live demo where you search for "Head & Shoulders" on Amazon, the extension pops up suggesting a "Shampoo Bar," you click it, and your phone *immediately* buzzes with a "Level Up" notification.
* **The Why:** This demonstrates the **Unified Ecosystem** perfectly.