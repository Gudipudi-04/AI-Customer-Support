\# SupportAI – AI-Based Customer Support Ticketing System



\## Project Overview



SupportAI is an AI-powered customer support ticket management system. It helps administrators manage customer support requests, automatically classify tickets using Machine Learning, assign agents, and track ticket status.



\## Features



\- Admin Registration and Login

\- JWT-based Authentication

\- Create and Manage Support Tickets

\- AI-Based Ticket Category Prediction

\- Ticket Categories: Technical, Billing, Account, General

\- Update Ticket Status

\- Assign Support Agents

\- Search and Filter Tickets

\- View Complete Ticket Details

\- Delete Tickets

\- Dashboard Statistics

\- Ticket Analytics and Charts



\## Technology Stack



\*\*Frontend\*\*

\- Next.js

\- React

\- TypeScript

\- Tailwind CSS

\- Recharts



\*\*Backend\*\*

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT Authentication

\- bcryptjs



\*\*Machine Learning\*\*

\- Python

\- FastAPI

\- Scikit-learn

\- TF-IDF Vectorizer

\- Multinomial Naive Bayes



\## Project Structure



```text

AI-Customer-Support/

│

├── frontend/

│   ├── app/

│   └── package.json

│

├── backend/

│   ├── models/

│   ├── routes/

│   ├── middleware/

│   ├── server.js

│   └── package.json

│

├── ml-service/

│   ├── main.py

│   ├── train.py

│   └── model.pkl

│

└── README.md

```



\## Installation and Setup



\### 1. Clone the Repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd AI-Customer-Support

```



\### 2. Backend Setup



```bash

cd backend

npm install

```



Create a `.env` file inside the backend folder:



```env

PORT=5000

MONGO\_URI=mongodb://127.0.0.1:27017/ai\_customer\_support

JWT\_SECRET=your\_long\_random\_secret

```



Start the backend:



```bash

npm run dev

```



\### 3. Frontend Setup



```bash

cd frontend

npm install

npm run dev

```



Open:



http://localhost:3000



\### 4. Machine Learning Service Setup



```bash

cd ml-service

python -m venv venv

venv\\Scripts\\activate

pip install fastapi uvicorn scikit-learn

python train.py

python -m uvicorn main:app --reload --port 8000

```



ML API:



http://127.0.0.1:8000



\## Application URLs



| Service | URL |

|---|---|

| Frontend | http://localhost:3000 |

| Backend | http://localhost:5000 |

| ML Service | http://127.0.0.1:8000 |



\## Main API Routes



| Method | Endpoint | Purpose |

|---|---|---|

| POST | /api/auth/setup | Initial admin setup |

| POST | /api/auth/login | Admin login |

| POST | /api/tickets/create | Create ticket |

| GET | /api/tickets | Get all tickets |

| PATCH | /api/tickets/:id | Update ticket |

| DELETE | /api/tickets/:id | Delete ticket |

| POST | /predict | AI category prediction |



Ticket routes require JWT authentication.



\## Machine Learning Workflow



1\. Customer submits a support ticket.

2\. Backend sends the ticket message to the Python ML service.

3\. ML model predicts the ticket category.

4\. Backend stores the ticket and predicted category in MongoDB.

5\. Admin can manage tickets from the dashboard.



\## Future Enhancements



\- Email Notifications

\- Automatic Ticket Priority Prediction

\- Advanced AI Chatbot

\- Agent Performance Reports

\- Cloud Deployment



\## Author



SupportAI Project



\## License



This project is developed for educational and demonstration purposes.

