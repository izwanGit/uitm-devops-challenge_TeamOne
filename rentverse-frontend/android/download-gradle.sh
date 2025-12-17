#!/bin/bash

# Script to manually download Gradle using fast mirrors
# This is useful when Gradle downloads are slow

GRADLE_VERSION="8.10.2"
GRADLE_DIR="$HOME/.gradle/wrapper/dists/gradle-${GRADLE_VERSION}-bin"

echo "Downloading Gradle ${GRADLE_VERSION}..."

# Create the directory if it doesn't exist
mkdir -p "$GRADLE_DIR"

# Try different mirrors (fastest first)
MIRRORS=(
    "https://mirrors.aliyun.com/gradle/gradle-${GRADLE_VERSION}-bin.zip"
    "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"
    "https://downloads.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"
)

for MIRROR_URL in "${MIRRORS[@]}"; do
    echo "Trying: $MIRROR_URL"
    
    # Generate a random hash directory name (Gradle wrapper format)
    HASH=$(echo -n "$MIRROR_URL" | shasum -a 256 | cut -d' ' -f1 | head -c 64)
    TARGET_DIR="$GRADLE_DIR/$HASH"
    mkdir -p "$TARGET_DIR"
    
    # Download to the target directory
    if curl -L -o "$TARGET_DIR/gradle-${GRADLE_VERSION}-bin.zip" "$MIRROR_URL"; then
        echo "✅ Successfully downloaded Gradle ${GRADLE_VERSION}!"
        echo "Location: $TARGET_DIR/gradle-${GRADLE_VERSION}-bin.zip"
        echo ""
        echo "Now extract it:"
        echo "cd $TARGET_DIR && unzip -q gradle-${GRADLE_VERSION}-bin.zip"
        exit 0
    else
        echo "❌ Failed to download from $MIRROR_URL"
        rm -rf "$TARGET_DIR"
    fi
done

echo "❌ All mirrors failed. Please try downloading manually:"
echo "Visit: https://gradle.org/releases/"
echo "Or use: https://mirrors.aliyun.com/gradle/gradle-${GRADLE_VERSION}-bin.zip"
