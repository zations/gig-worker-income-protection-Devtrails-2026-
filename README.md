# **Gig Worker Income Protection Platform**

## **Problem Context**



Gig workers in urban delivery ecosystems face a unique financial risk: their income depends entirely on their ability to remain physically mobile within the city. When unexpected disruptions occur — such as heavy rainfall, flooding, protests, road blockades, or construction — delivery activity in affected zones may slow down or stop entirely.



Traditional insurance products are not designed for such short-duration income interruptions. Filing claims for a few hours of lost income is impractical and slow. As a result, gig workers often absorb these losses themselves.



This project proposes a parametric micro-insurance platform for gig workers, where disruption events automatically trigger compensation when workers are affected by verified external conditions. The system detects disruptions, verifies worker presence in affected zones, prevents fraud, and sends payouts without requiring manual claims.



The goal is to provide fast, fair, and automated income protection for gig workers.



## **Why Focus on Food Delivery Workers**



The gig economy includes multiple types of workers such as grocery delivery, parcel delivery, ride-hailing drivers, and logistics workers. However, food delivery workers were selected as the primary persona for this system because their work patterns make them particularly suitable for parametric income protection.



Food delivery operates continuously across seasons, weather conditions, and economic cycles. Unlike parcel deliveries or grocery services, food demand exists almost every day of the year and across most hours of the day. Even during heavy rain or city disruptions, people continue ordering food, which means delivery workers are still expected to operate in difficult conditions.



Other gig sectors show more variability. Grocery deliveries may drop significantly during storms or holidays. E-commerce parcel deliveries may pause entirely due to logistics delays. Ride-hailing drivers may choose to stop working during bad weather. Food delivery, however, continues operating even in adverse conditions.



Because of this constant activity, disruptions such as flooding, protests, or roadblocks have a direct impact on the earnings of food delivery workers. This makes them an ideal target group for a system that protects workers from short-term operational disruptions.



## **Example Scenario**



Consider a delivery worker named Ravi who operates in the Velachery area of Chennai. Ravi typically works during lunch and dinner hours and relies on steady delivery orders to earn income.



On a weekday evening, heavy rainfall causes localized flooding in the Velachery area. Roads become partially blocked and delivery speeds slow dramatically. Restaurants continue receiving orders, but many deliveries cannot be completed efficiently due to traffic congestion and flooded streets.



In a traditional system, Ravi would simply earn less money that day with no compensation. In this platform, the disruption is automatically detected through weather data and worker activity signals. The system confirms that Ravi was actively working in the affected zone when the event occurred.



Once the disruption is validated, the platform calculates the estimated income loss and automatically transfers a payout to Ravi’s account. Ravi does not need to file any claim or submit documentation. The compensation arrives automatically because the disruption conditions were verified.



This is the core principle of parametric insurance: payouts are triggered by measurable events rather than manual claim processes.



## **Parametric Design Principles**



The entire platform is built on the concept of parametric insurance, where payouts are triggered by predefined measurable conditions rather than subjective claims. To make such a system reliable and fair, the parameters used to trigger payouts must satisfy three important characteristics.



First, the parameters must be objectively measurable. This means the data used to detect disruptions must come from quantifiable sources such as rainfall intensity, air quality readings, traffic speed data, or verified worker telemetry. Subjective or unverifiable inputs cannot be used as triggers.



Second, the parameters must be publicly verifiable. External data sources such as weather feeds or pollution readings must come from trusted providers so that both workers and insurers can verify that the disruption event genuinely occurred.



Third, the parameters must be strongly correlated with income loss. The chosen signals should represent real disruptions that affect delivery operations. For example, heavy rainfall combined with traffic congestion may significantly reduce delivery efficiency, while mild weather changes may have little impact.



By selecting parameters that satisfy these three properties, the platform ensures that payouts are fair, transparent, and resistant to manipulation.



### **Weekly Protection Plans**



Workers purchase income protection through simple weekly subscription plans. These plans define the maximum payout available during disruption events and the total protection coverage for the week.



Example plans may include:



#### **Basic Plan**

• Weekly premium: ₹19

• Maximum event payout: ₹200

• Weekly coverage cap: ₹600



#### **Standard Plan**

• Weekly premium: ₹29

• Maximum event payout: ₹350

• Weekly coverage cap: ₹1000



#### **Enhanced Plan**

• Weekly premium: ₹39

• Maximum event payout: ₹500

• Weekly coverage cap: ₹1500



Workers can renew or upgrade their plans each week depending on their expected work schedule.





## **System Workflow Overview**



The platform architecture consists of two primary user groups: gig workers using the mobile application and insurance administrators monitoring the system through a dashboard. Between these two layers sits the backend intelligence engine responsible for event detection, fraud prevention, and payout processing.



The workflow can be understood through three main components: the worker application, the backend platform, and the AI decision engine.

### 

### **1.Dynamic Pricing Workflow**



The weekly pricing of the insurance plan is not fixed for every worker. Instead, the system calculates a premium suggestion at the beginning of each weekly cycle based on the expected disruption risk of the worker’s operating zone.



The process begins before the worker renews or purchases protection for the upcoming week.



First, the backend identifies the worker’s primary operating zones using the worker profile created during onboarding. Workers may select preferred zones during registration, but the system also refines this information using historical movement data collected during previous working periods.



Because the system already tracks worker movement patterns through geographic clusters, the backend can estimate which delivery zones the worker most frequently operates in. These zones become the basis for disruption risk evaluation.



Once the zones are identified, the pricing service collects contextual signals associated with those areas. These signals include:



•rainfall probability and historical flood patterns



•traffic slowdown frequency



•pollution or AQI trends



•historical disruption events



•restaurant cluster density



•historical payout frequency in the zone



This information is converted into a structured feature set and passed into the risk scoring model.



The model estimates the probability that workers operating in those zones will encounter disruption events during the upcoming weekly window. The model output is not directly shown to the worker. Instead, it is translated into an internal zone risk score used by the pricing engine.



The pricing layer then calculates three outputs:



•recommended premium value



•weekly payout cap



•available plan tiers



For example, a zone with low disruption probability may produce a lower premium and a smaller weekly payout cap. A zone with frequent rainfall and high congestion may produce a slightly higher premium but also allow stronger protection coverage.



Once the pricing engine generates these values, the backend sends the available plan options to the worker application. The worker simply sees plan choices such as Basic, Standard, and Enhanced, along with the weekly premium and payout limits.



Internally, however, those prices have already been adjusted based on zone-level risk intelligence generated by the AI model.



This design ensures that workers in high-risk zones are still able to purchase protection while keeping the insurance pool financially sustainable.



#### **2.Worker Application Workflow (Zero-Touch)**



The worker application serves as the main interface between delivery workers and the insurance platform. It is responsible for onboarding workers, enabling weekly protection purchases, collecting telemetry signals, and displaying payout notifications.



The workflow begins when the worker installs the application and completes onboarding. During onboarding, the app collects:



•phone number verification via OTP



•worker name



•city of operation



•delivery category (food delivery)



•preferred working zones



•payout account information such as UPI ID



These details are sent to the backend and stored in the worker profile database. At this stage the system establishes identity, operating geography, and payout routing.



After onboarding, the worker enters the protection screen where the app requests weekly plan suggestions from the backend. The backend generates these plans using the dynamic pricing workflow described earlier and returns available plans with premium values, payout caps, and coverage duration.



The worker selects a plan and completes payment using the in-app payment gateway. Once payment succeeds, the backend activates the worker’s protection policy and records the policy start and end time in the database.



From this point onward the worker is insured for the weekly period.



During the week, the worker continues using the same app while performing deliveries. The system does not require workers to manually start or stop shifts. Manual shift buttons introduce friction and can create loopholes if workers forget to activate them.



Instead, the platform uses zero-touch activity detection based on movement patterns across geographic clusters.



Zero-Touch Activity Detection



The backend maintains a database of geographic clusters representing key delivery areas within the city. These clusters include:



•restaurant hubs



•residential delivery neighborhoods



•commercial districts



Each cluster is stored in a spatial database such as PostGIS with indexed geographic boundaries.



Whenever the worker’s phone sends a location update, the backend performs a spatial query to determine which cluster contains the coordinates.



Because these clusters are precomputed and indexed, the lookup operation is extremely fast and avoids expensive calls to external map APIs.



The backend then analyzes sequences of cluster transitions over time. Food delivery operations follow a predictable movement pattern: workers travel from restaurants to customer residences and then return toward restaurant clusters to pick up the next order.



A typical delivery cycle appears as:



Restaurant cluster → Residential zone → Restaurant cluster



This sequence corresponds to the natural pickup → delivery → return pattern of food delivery work.



When the backend observes repeated transitions between restaurant clusters and residential delivery zones, it infers that the worker is actively performing deliveries.



If such patterns occur consistently within a time window, the system marks the worker as actively working during that period.



This approach allows the platform to determine worker activity automatically without requiring manual shift buttons. As long as workers move between delivery clusters in realistic patterns, the platform recognizes them as active.



When a disruption event occurs, the eligibility engine checks whether the worker was performing cluster transitions within the affected zone during the disruption window. If the movement patterns match active delivery behavior, the worker becomes eligible for compensation under their protection plan.



This cluster-based inference mechanism enables a true zero-touch experience where workers never need to manually submit claims or activate work sessions.



#### **3.Backend Event Detection Workflow**



The event detection engine is the part of the backend that continuously watches the city environment for disruption signals. Its job is not to decide payouts directly. Its job is to convert raw external data into verified disruption events attached to zones and time windows.



This process starts with scheduled ingestion jobs running in the backend. These jobs periodically fetch data from weather providers, pollution data sources, traffic feeds, and any manually curated alert source used by the platform. Each source provides raw values in different formats, so the first backend task is normalization. For example, rainfall may come as millimeters per hour, traffic may come as speed index, and pollution may come as AQI. The ingestion service converts these into a unified internal event format.



The normalized data is then mapped to the platform’s delivery zones. This is important because the system does not reason over the whole city as one unit. It reasons over smaller geographic clusters. A rainfall spike in one micro-zone should not automatically affect the entire city. The backend therefore attaches each incoming signal to one or more geographic zones using spatial mapping.



Once signals are mapped to zones, the event detection rules are evaluated. These rules may be simple threshold logic or model-assisted scoring. For example, heavy rain alone may not be enough to declare a compensable event, but heavy rain combined with abnormal traffic slowdown and local flood severity may be enough. If the conditions satisfy the disruption rule, the engine creates an event object.



That event object contains the event type, affected zone, start time, severity score, and current status. At this point the event is real inside the system, but it is still not a payout. It simply means the backend has enough evidence to say that a disruption exists in a specific place and time window.



The event object is then passed downstream to the eligibility engine. This separation is important. Event detection confirms that “something happened in this zone,” while eligibility later determines “which insured workers in this zone are entitled to protection.”



#### **4.Geo-Tagged Photo Evidence Workflow**



Some disruptions are visible on the street but not visible to structured APIs. Protests, temporary barricades, road work, and local blockades may directly affect food delivery operations without immediately appearing in official data feeds. To capture such cases, the platform includes a worker-reported disruption pathway using geo-tagged photo evidence.



This workflow begins when a worker notices a local disruption that is clearly affecting deliveries. The worker opens the reporting section in the app and takes a photo using the in-app camera. The app does not allow gallery upload because the goal is to capture live evidence rather than previously stored images. At the moment the image is captured, the app also collects supporting metadata such as GPS coordinates, timestamp, device information, and camera orientation.



Before this report is accepted by the backend, the location attached to the image goes through the anti-spoofing checks used elsewhere in the platform. If the device trust is too low or the location appears manipulated, the report is rejected or marked low-confidence. If it passes the phone-side integrity checks, the report is uploaded to the backend and stored as a disruption report record.



One report is not enough to create an insured event. The backend waits for multiple reports from nearby workers within a limited geographic radius and time window. This is where crowd consensus comes in. If several workers report the same area within a short period, the backend increases the event confidence score. The system may also optionally run a lightweight image analysis model to look for visible evidence such as barricades, crowd gatherings, floodwater, or construction equipment.



When both spatial consensus and evidence validation are strong enough, the event validation engine upgrades the reports into a formal disruption event. From that point onward, the workflow joins the standard backend pipeline: eligibility is checked, fraud scores are applied, and payouts are calculated for workers genuinely affected by the event.



This design keeps the parametric nature of the platform intact. The system still does not pay a single worker because they sent a photo. Instead, the photo becomes one input used to validate that a disruption event objectively existed.



#### **5.AI and Machine Learning Workflow**



The machine learning part of the system is not one single model. It is a set of three models used at different stages of the lifecycle.



The first model is the risk scoring model. It runs before plan purchase or weekly renewal. The backend gathers zone-related features such as rainfall probability, disruption history, flood frequency, traffic burden, restaurant density, and previous claims in the area. These features are passed into the model, which produces a zone-level risk score. That risk score is then translated into premium suggestions and plan configuration. So the AI does not directly charge the worker; it assists the pricing engine by predicting disruption likelihood.



The second model is the fraud detection model. This model runs after a disruption event has been detected and candidate workers have already been identified. The backend constructs a feature set from device telemetry and historical worker behavior. This may include GPS path smoothness, time spent in the affected zone, movement realism, GNSS signal quality, repeated suspicious claim timing, cluster anomalies, and device trust score from the anti-spoofing layer. The fraud model then generates a fraud risk score. That score decides whether the payout will be automatically approved, held for soft review, or blocked for manual investigation.



The third model is the impact estimation model. Once a worker is event-eligible and not flagged as highly suspicious, the backend needs to estimate how much income the worker likely lost. This is especially important in food delivery because income varies sharply by time of day, restaurant density, traffic conditions, and disruption severity. The model takes inputs such as event duration, event severity, dinner or lunch peak context, worker average earnings, and zone demand intensity. It then predicts expected income loss. The payout engine maps that estimate to a payout band so that the final compensation remains within the worker’s plan limits.



Taken together, these three models allow the platform to make three separate decisions intelligently: how much to charge, whether the event interaction looks genuine, and how much to pay.



#### **6.Anti-Spoofing and Adversarial Defense Workflow**



Because payout eligibility depends heavily on location signals, the system must protect itself from GPS spoofing attacks. A worker attempting to fake their presence inside a disruption zone could trigger fraudulent payouts.



To prevent this, the platform uses a layered anti-spoofing architecture combining device-side verification and server-side anomaly detection.



Layer 1 — Basic Device Integrity Checks



The first level of verification happens directly on the worker’s device.



The mobile application performs basic spoof detection checks such as:



•detecting mock location providers



•detecting emulator environments or developer mode



•checking device integrity flags



These signals indicate whether the device environment may be manipulating location data.





Layer 2 — GNSS Satellite Validation



The second layer verifies the underlying satellite signals used to compute the GPS position.



Instead of trusting only latitude and longitude, the app inspects GNSS telemetry including:



•satellite count



•signal strength distribution



•constellation diversity



Real GPS fixes typically include signals from multiple satellite constellations such as:



•GPS



•GLONASS



•Galileo



•BeiDou



Most simple spoofing tools alter coordinates but do not simulate realistic satellite measurements. If GNSS telemetry appears unrealistic or missing, the system reduces the location trust score.





Layer 3 — Sensor Fusion Validation



The third layer compares GPS movement with signals from other sensors in the device.



These include:



•accelerometer readings



•gyroscope rotation



•Wi-Fi network environment changes



If the GPS path indicates significant movement but the device sensors show no motion activity, the system treats the signal as suspicious.



This sensor fusion step helps detect cases where attackers replay or simulate location data.



#### **7.Payment and Payout Workflow**



After a disruption event is confirmed, eligible workers are identified, and fraud scoring is applied, the payout engine begins the final payout process.



The payout engine first checks the worker’s active policy and reads the plan rules. It verifies the maximum payout allowed for a single event, the remaining weekly coverage balance, and any dynamic payout band associated with the impact estimation model. If the worker has already consumed most of the weekly cap, the engine reduces the current payout accordingly so the policy is not exceeded.



Once the payout amount is finalized, the backend creates a payout order. This order includes the worker ID, policy ID, event ID, approved amount, and associated fraud score. The payment orchestration service then sends this order to the configured payment route. In the hackathon prototype this may be simulated through a wallet or sandbox transfer, but the logical flow mirrors real UPI or bank payout infrastructure.



After the payment gateway responds, the backend stores the payment status and updates the worker’s remaining coverage balance. The notification service then pushes an update to the worker app. The worker sees that a disruption was detected, their protection was applied, and the money was credited. On the insurer side, the same payout appears in the dashboard with event reference, payout amount, and fraud clearance state.



This is the final output of the entire system: not just event detection, but event detection translated into controlled, fraud-resistant, automatically executed financial compensation.

## 

## **Technology Stack**



The system is designed using a modern full-stack architecture.



Mobile Application

Flutter or React Native for cross-platform mobile development.



Backend API Layer

FastAPI or Node.js for REST APIs and service orchestration.



Databases

PostgreSQL for transactional data storage and Redis for caching and background task queues.



Geospatial Processing

PostGIS for location indexing and zone queries.



Machine Learning

Python with scikit-learn and XGBoost for risk prediction, fraud detection, and impact estimation models.



Cloud Services

Map APIs for geospatial visualization and Firebase Cloud Messaging for push notifications.



Payment Integration

Razorpay or similar payment gateways for premium collection and payout processing.

## 

## **Development Plan**



The development process can be structured into several phases.



The first phase focuses on building the core worker application and backend API infrastructure. This includes worker onboarding, policy purchase workflows, and basic shift tracking functionality.



The second phase implements disruption detection and event ingestion pipelines using external APIs and worker telemetry signals.



The third phase integrates machine learning models for risk scoring, fraud detection, and income impact estimation.



The final phase introduces advanced features such as geo-tagged disruption reporting, anti-spoofing defenses, and administrative dashboards for monitoring system performance.



By combining parametric insurance principles, real-time telemetry analysis, and machine learning decision models, the platform creates a scalable solution for protecting gig workers from income disruptions in urban delivery ecosystems.


