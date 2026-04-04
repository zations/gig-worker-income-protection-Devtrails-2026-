# 🛡️ Zentry: Parametric Protection Console

**"The Zero-Touch Safety Net for the Gig Economy"**

[](https://www.google.com/search?q=https://reactnative.dev/)
[](https://www.google.com/search?q=)
[](https://www.google.com/search?q=)

> **Vision:** Zentry eliminates the friction of traditional insurance. By using real-time data triggers (weather, traffic, protests), we provide automated, claim-less payouts to delivery partners and drivers the moment their income is at risk.

-----

## 🚀 The Core Innovation: "Zero-Touch"

Traditional insurance requires a human to file a claim. **Zentry** uses **Parametric Logic**. If the parameter is met (e.g., Rainfall \> 50mm in Velachery), the payout is triggered automatically.

### Key Pillars

  * **Passive Telemetry:** Background GPS clusters verify the worker's presence in high-risk zones without draining battery.
  * **Dynamic AI Pricing:** Risk scores (0.0 to 1.0) are calculated in real-time based on historical flood data and live infrastructure ratings.
  * **Crowd-Sourced Validation:** A Geo-Tag Console for events that APIs miss (local protests, sudden roadblocks), protected by hardware-level telemetry overlays to prevent fraud.

-----

## 🛠️ Features for Judges

| Feature | Description | Judging Criteria Met |
| :--- | :--- | :--- |
| **Simulation Lab** | A built-in debug suite to trigger "Rain Events" or "Risk Spikes" during the demo. | **Technical Robustness** |
| **Dynamic Policy Config** | Plans (Basic/Standard/Premium) that adjust pricing based on the user's Vehicle Type and Zone. | **AI/Product Logic** |
| **Geo-Tag Console** | In-app camera with hardcoded Lat/Long/Timestamp overlays to prevent gallery uploads. | **Security & Fraud Prevention** |
| **Real-time Activity Feed** | A transparent log of every automated payout and system check. | **User Trust & UX** |

-----

## 💻 Tech Stack

  * **Frontend:** React Native CLI (v0.7x)
  * **Navigation:** React Navigation (Stack + Bottom Tabs)
  * **Animations:** React Native Reanimated (for smooth simulation transitions)
  * **UI Components:** React Native Shadow-2, Vector Icons
  * **Data:** Integrated Mock Service (Simulating high-latency Backend API calls)

-----

## 🏃‍♂️ Getting Started

### Prerequisites

  * Node.js (\>18)
  * Android Studio & SDK
  * JDK 17

### Installation

1.  **Clone and Install:**
    ```bash
    npm install
    npm install react-native-worklets react-native-gesture-handler
    ```
2.  **Android Setup:**
    Ensure `android/build.gradle` is configured with `google()` and `mavenCentral()` repositories.
3.  **Build the App:**
    ```bash
    npx react-native run-android
    ```

-----

## 🧠 Architecture: The "Fake-End" Strategy

To ensure a flawless demo despite backend resource constraints, Zentry utilizes a **Mock-Integrated Architecture**.

  * **`services/mockApi.js`**: Simulates server logic, including fraud scoring, payout ID generation, and network latency.
  * **`context/UserContext.js`**: Maintains the "System State," allowing the Home Screen to react instantly to events triggered in the Simulation Lab.

-----

## 🚧 Roadmap

  - **Phase 2:** Integration with OpenWeatherMap & Google Maps Traffic APIs.
  - **Phase 3:** Smart Contract implementation for immutable payout ledger.
  - **Phase 4:** Multi-city rollout starting with Chennai and Bengaluru.

-----