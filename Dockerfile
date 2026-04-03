# 1. Use a Node.js base image
FROM node:20-slim

# 2. Install Python and the C++ libraries required by OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory
WORKDIR /usr/src/app

# 4. Install Node.js dependencies
COPY package*.json ./
RUN npm install

# 5. Set up Python environment and install packages
# We use a virtual environment to keep the container clean
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy all project files (including server.js and the service folder)
COPY . .

# 7. Expose the port (Render uses this to route traffic)
EXPOSE 5000

# 8. Start the server
# This matches your file name 'server.js'
CMD [ "node", "server.js" ]