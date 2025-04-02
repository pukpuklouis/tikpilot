# Docker Containerization Issues Report

## Current Status

We've been working on containerizing the TikPilot application which consists of a Rust backend, Node.js frontend, and SQLite database. Despite multiple attempts to fix the configuration, we're still encountering issues that prevent the containers from running properly.

## Issues Identified

### 1. Backend Container Failures

- **Error Message**: `Error: missing field 'server'`
- **Root Cause**: The backend application is failing to load its configuration properly. The `Settings` struct in `config/mod.rs` expects a server configuration, but it seems the configuration files aren't being found or loaded correctly.
- **Attempted Fixes**: 
  - Updated the Dockerfile to simplify the build process
  - Modified the server to bind to `0.0.0.0` instead of `127.0.0.1`
  - Removed problematic volume mounts that were causing path conflicts

### 2. Volume Mounting Issues

- **Error Message**: `error mounting "/Users/pukpuk/Dev/tikpilot/apps/backend" to rootfs at "/usr/src/app/backend": create mountpoint for /usr/src/app/backend mount: cannot create subdirectories`
- **Root Cause**: There appears to be a mismatch between the directory structure in the container and the host machine, causing Docker to fail when trying to mount volumes.
- **Attempted Fixes**:
  - Removed problematic volume mounts from docker-compose.yml
  - Simplified the Dockerfile to avoid nested directory structures

### 3. Multi-stage Build Complications

- **Error Message**: `failed to calculate checksum of ref... "/usr/src/app/backend/target/release/backend": not found`
- **Root Cause**: The multi-stage build process had path inconsistencies between the builder and runtime stages.
- **Attempted Fixes**:
  - Simplified the Dockerfile to use a more straightforward directory structure
  - Updated paths in the COPY commands to match the actual build output locations

## Required Research and Next Steps

1. **Configuration Loading**:
   - Investigate how the backend application loads its configuration
   - Determine if environment variables can be used instead of configuration files
   - Check if the `config` directory exists and contains the necessary files

2. **Container Directory Structure**:
   - Review the directory structure inside the containers to ensure consistency
   - Verify that the paths in the Dockerfiles match the expected structure in the application code

3. **Development vs. Production Mode**:
   - Determine if there are different configuration requirements for development vs. production
   - Consider creating separate Dockerfiles or docker-compose configurations for each environment

4. **Database Connectivity**:
   - Verify that the database URL is correctly configured and accessible from the backend container
   - Check if the database is being properly initialized and populated

5. **Logging and Debugging**:
   - Enhance logging in the backend application to provide more detailed error information
   - Use Docker's exec command to inspect the container's filesystem and verify file locations

## Recommendations

1. **Simplify for Initial Success**:
   - Start with a minimal working configuration for each container
   - Add complexity incrementally once the basic setup is working
   - Consider using a simpler configuration approach (e.g., environment variables) initially

2. **Consistent Directory Structure**:
   - Ensure consistent directory naming and paths across Dockerfiles and application code
   - Document the expected directory structure for future reference

3. **Configuration Management**:
   - Create a clear strategy for managing configuration across different environments
   - Consider using Docker secrets or environment files for sensitive configuration

4. **Testing Strategy**:
   - Develop a systematic approach to testing each container individually before integration
   - Create health check scripts that can verify the application is functioning correctly

## Conclusion

The containerization issues appear to be primarily related to configuration loading and directory structure mismatches. By focusing on these areas and simplifying the initial approach, we should be able to resolve the current blockers and successfully containerize the application.

## Fixes Implemented

- **Backend Configuration**: Updated the configuration loading mechanism to ensure the `Settings` struct receives the necessary `server` field. Utilized environment variables as a fallback.
- **Volume Mount Correction**: Adjusted Docker volume mounts in `docker-compose.yml` and Dockerfiles to align the container directory structure with the host system.
- **Multi-stage Build**: Revised the multi-stage Docker build process with corrected COPY paths to match build output structure.

## Next Steps

- Monitor container logs to verify stability.
- Gradually introduce additional configuration complexity in a controlled manner.
