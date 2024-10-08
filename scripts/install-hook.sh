#!/bin/bash

# Create the pre-commit hook file
cat > .git/hooks/pre-commit << EOL
#!/bin/sh

echo "Running formatter..."
if pnpm format --check | grep -q "Files were formatted"; then
  exit 1
fi

echo "Running type check, lint, and test..."
turbo type-check lint test || exit 1

echo "All checks passed"
exit 0
EOL

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "Pre-commit hook installed successfully!"
