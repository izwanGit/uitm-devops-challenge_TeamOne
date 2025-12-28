# API URL Configuration Migration

## Overview

This document describes the migration from hardcoded URLs to environment-configurable base paths in the Rentverse frontend application.

## Changes Made

### 1. Centralized Configuration (`utils/apiConfig.ts`)

Enhanced the API configuration utility to support multiple services:

- **Main API Service**: `getApiBaseUrl()` and `getApiUrl()`
- **AI Service**: `getAiServiceBaseUrl()` and `getAiServiceApiUrl()`
- **Cloudinary**: `getCloudinaryBaseUrl()` and `createCloudinaryUploadUrl()`
- **MapTiler**: `getMapTilerBaseUrl()` and `createMapTilerApiUrl()`

### 2. Updated API Clients

#### Files Modified:
- `utils/favoritesApiClient.ts` - Now uses centralized config
- `utils/propertyTypesApiClient.ts` - Updated to use `getApiUrl()`
- `utils/priceRecommendationApi.ts` - Now uses AI service config
- `utils/uploadService.ts` - Uses centralized Cloudinary config
- `utils/geocoding.ts` - Uses centralized MapTiler config

### 3. Updated Pages

#### Files Modified:
- `app/rents/page.tsx` - Rental agreement download endpoint
- `app/property/[id]/modify/page.tsx` - Property deletion endpoint
- `app/admin/page.tsx` - All admin API endpoints
- `app/property/all/page.tsx` - My properties endpoint
- `app/rents/[id]/page.tsx` - Rental agreement endpoints

### 4. Environment Variables

#### New Variables Added:
```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://rentverse-be.jokoyuliyanto.my.id
NEXT_PUBLIC_API_URL=https://rentverse-be.jokoyuliyanto.my.id  # For backward compatibility

# AI Service Configuration
NEXT_PUBLIC_AI_SERVICE_URL=http://rentverse-ai.jokoyuliyanto.my.id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dd1f3rawl
NEXT_PUBLIC_CLOUDINARY_BASE_URL=https://api.cloudinary.com
NEXT_PUBLIC_CLOUDINARY_ASSET_BASE_URL=https://res.cloudinary.com

# MapTiler Configuration
NEXT_PUBLIC_MAPTILER_API_KEY=your_api_key_here
NEXT_PUBLIC_MAPTILER_BASE_URL=https://api.maptiler.com
```

## Benefits

### 1. Environment Flexibility
- Easy switching between development, staging, and production environments
- Support for local development with different backend services
- No code changes required for different deployments

### 2. Service Isolation
- Separate configuration for different services (API, AI, Cloudinary, MapTiler)
- Individual service URLs can be updated without affecting others
- Better service provider migration support

### 3. Maintainability
- Centralized URL management
- Consistent API endpoint construction
- Easier debugging and monitoring

## Migration Guide

### For Developers

1. **Copy Environment Template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Update Local Environment**:
   ```env
   # For local development
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001
   ```

3. **Import Configuration**:
   ```typescript
   import { createApiUrl, createAiServiceApiUrl } from '@/utils/apiConfig'
   
   // Instead of hardcoded URLs
   const response = await fetch(createApiUrl('properties'))
   ```

### For Deployment

1. **Production Environment**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.production.domain.com
   NEXT_PUBLIC_AI_SERVICE_URL=https://ai.production.domain.com
   ```

2. **Staging Environment**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.staging.domain.com
   NEXT_PUBLIC_AI_SERVICE_URL=https://ai.staging.domain.com
   ```

## Backward Compatibility

- Legacy environment variable names are still supported
- Fallback to production URLs if environment variables are not set
- Existing API clients continue to work without changes

## Testing

### Local Development
1. Start with default production URLs (no env vars)
2. Test with local backend (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`)
3. Test with different AI service URLs

### Production Verification
1. Verify all API calls use environment-configured URLs
2. Check network tab for correct endpoint URLs
3. Test environment variable overrides

## Future Enhancements

1. **Service Health Checks**: Add endpoint health verification
2. **URL Validation**: Add runtime URL validation
3. **Load Balancing**: Support multiple URLs per service
4. **Circuit Breaker**: Add fallback URL patterns

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**:
   - Application falls back to production URLs
   - Check `.env.local` file exists and has correct variables

2. **CORS Issues**:
   - Ensure backend allows requests from your frontend domain
   - Check API_BASE_URL configuration on backend

3. **404 Errors**:
   - Verify API endpoints are correct
   - Check if backend is running on specified URL

### Debug Information

Enable debug logging:
```typescript
console.log('API Base URL:', getApiBaseUrl())
console.log('AI Service URL:', getAiServiceBaseUrl())
```