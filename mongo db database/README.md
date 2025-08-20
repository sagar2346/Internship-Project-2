# MongoDB Database Layer (Not Active)

As specified in the application requirements, this project operates **WITHOUT an active database**. 

All favorites lists and weekly meal plans are managed **in-memory** on the Express backend (`/server`) using native JavaScript arrays and objects.

### Characteristics of In-Memory Storage:
1. Fast read/write performance.
2. Simplifies app deployment and setup (no database configurations or credential parameters required).
3. Resets to defaults when the backend server restarts.
