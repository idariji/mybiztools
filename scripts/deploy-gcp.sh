#!/bin/bash
# MyBizTools - Google Cloud Deployment Script
# Usage: ./scripts/deploy-gcp.sh [PROJECT_ID] [REGION]

set -e

# Configuration
PROJECT_ID=${1:-"your-gcp-project-id"}
REGION=${2:-"us-central1"}
BACKEND_SERVICE="mybiztools-backend"
FRONTEND_SERVICE="mybiztools-frontend"

echo "============================================"
echo "  MyBizTools - Google Cloud Deployment"
echo "============================================"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo "Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com

echo ""
echo "============================================"
echo "  Step 1: Building and Deploying Backend"
echo "============================================"

# Build backend image
echo "Building backend Docker image..."
cd mybiztools-backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE

# Deploy backend to Cloud Run
echo "Deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port 8080 \
    --set-env-vars "NODE_ENV=production"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
echo ""
echo "Backend deployed at: $BACKEND_URL"

cd ..

echo ""
echo "============================================"
echo "  Step 2: Building and Deploying Frontend"
echo "============================================"

# Build frontend image with backend URL
echo "Building frontend Docker image..."
gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --substitutions=_VITE_API_URL=$BACKEND_URL

# Deploy frontend to Cloud Run
echo "Deploying frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port 80

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL:  $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Set up Cloud SQL PostgreSQL instance"
echo "2. Configure environment variables in Cloud Run"
echo "3. Set up custom domain (optional)"
echo "4. Configure Cloud Armor for DDoS protection (recommended)"
echo ""
echo "To configure environment variables:"
echo "  gcloud run services update $BACKEND_SERVICE --region=$REGION \\"
echo "    --set-env-vars 'DATABASE_URL=...,JWT_SECRET=...,API_KEY=...'"
echo ""
