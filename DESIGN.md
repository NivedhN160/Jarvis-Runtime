# System Design & Architecture - MAT-CHA.AI

## 1. Process Flow Diagram
The following diagram illustrates the end-to-end flow from discovery to deal confirmation, powered by Kiro's spec-driven AI logic.

```mermaid
sequenceDiagram
    participant S as Startup (Brand)
    participant K as MAT-CHA AI Engine
    participant V as Vector DB (ChromaDB)
    participant C as Creator
    
    S->>K: Submit Collaboration Spec (Requirements)
    K->>V: Generate Embeddings & Search Niches
    V-->>K: Return Top Creator Matches
    K-->>S: Present Matches with AI Reasonings
    S->>C: Direct Match & Initiation (Chat)
    C->>S: Discuss & Negotiate (48h Ephemeral)
    S->>K: AI Drafts Contract/Script
    S->>C: Request "Confirm Deal"
    C->>S: Multi-sig Confirmation
    Note over S,C: Deal Secured & Archived
```

## 2. High-Level Architecture (AWS Integrated)
Our architecture maximizes the use of AWS managed services for scalability and AI performance.

```mermaid
graph TD
    User((User)) -->|Amplify Hosting| Frontend[React Web App]
    Frontend -->|API Gateway| Backend[FastAPI on App Runner/Lambda]
    
    subgraph "Intelligence Layer"
        Backend -->|Semantic Search| ChromaDB[(ChromaDB)]
        Backend -->|Inference| Bedrock[Amazon Bedrock]
    end
    
    subgraph "Persistence Layer"
        Backend -->|Managed| MongoDB[(MongoDB Atlas on AWS)]
        Backend -->|Assets| S3[Amazon S3]
    end
```

## 3. Tech Stack & AWS Services
| Component | Technology | AWS Service |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS | **AWS Amplify** |
| **Backend** | FastAPI (Python 3.12) | **AWS App Runner** |
| **AI Matching** | Sentence-Transformers | **Amazon SageMaker** (Future) |
| **Generative AI** | Llama 3 / Claude 3 | **Amazon Bedrock** |
| **Primary Database**| MongoDB Atlas | Hosted on AWS |
| **Vector Storage** | ChromaDB | Containerized on EKS/Fargate |
| **Asset Storage** | Cloudinary / Local | **Amazon S3** |

## 4. Component Design

### 4.1 Spec-Driven Matching (Kiro Logic)
1. **Input**: Startup provides a natural language description of their campaign.
2. **Embedding**: The description is tokenized and converted into a vector.
3. **Retrieval**: ChromaDB performs a cosine-similarity search against indexed creator bios.
4. **Refinement**: **Amazon Bedrock** analyzes the top 5 candidates to provide a qualitative "Match Score" and custom reasoning.

### 4.2 Ephemeral Communication & Transparency
- **48h Message TTL**: Implemented via MongoDB TTL indexes to ensure data privacy and prompt action.
- **Optimistic Updates**: Using React Context to provide sub-second UI feedback during chat interactions.

## 5. Security & Availability
- **IAM Roles**: Least-privilege access for Bedrock and S3 integration.
- **Environment Management**: All secrets (API Keys, DB URIs) are managed via **AWS Secrets Manager**.
- **Edge Delivery**: Global distribution via Amplify CDN to ensure fast performance across different regions in India.

## 6. Development Workflow (Kiro)
This repository is built using Kiro's spec-driven development pattern:
1. Define requirements in `REQUIREMENTS.md`.
2. Map architecture in `DESIGN.md`.
3. Kiro generates the boilerplate and core logic based on these unified specifications.
