#!/usr/bin/env node

/**
 * Generate version info from git commit
 * Runs during build to capture current commit hash and message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  const commitAuthor = execSync('git log -1 --pretty=%an').toString().trim();
  const commitDate = execSync('git log -1 --pretty=%ai').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  const versionInfo = {
    commit: commitHash,
    message: commitMessage.split('\n')[0], // First line only
    author: commitAuthor,
    date: commitDate,
    branch: branch,
    buildTime: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, '../public/version-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

  console.log(`✓ Version info generated: ${commitHash}`);
  console.log(`  Message: ${versionInfo.message}`);
  console.log(`  Branch: ${branch}`);
} catch (error) {
  console.error('⚠ Failed to generate version info:', error.message);
  // Don't fail the build if git isn't available
}
