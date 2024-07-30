#!/bin/bash

# Create the pre-commit hook file
cat > .git/hooks/pre-commit << EOL
#!/bin/bash

# Run formatting
echo "Running formatter..."
pnpm format
if [ \$? -ne 0 ]; then
    echo "Formatting failed"
    exit 1
fi

# Run turbo tasks in parallel
echo "Running type check, lint, and test in parallel..."
pnpm turbo type-check & TYPE_CHECK_PID=\$!
pnpm turbo lint & LINT_PID=\$!
pnpm turbo test & TEST_PID=\$!

# Wait for all background processes to complete
wait \$TYPE_CHECK_PID
TYPE_CHECK_STATUS=\$?
wait \$LINT_PID
LINT_STATUS=\$?
wait \$TEST_PID
TEST_STATUS=\$?

# Check if any of the processes failed
if [ \$TYPE_CHECK_STATUS -ne 0 ] || [ \$LINT_STATUS -ne 0 ] || [ \$TEST_STATUS -ne 0 ]; then
    echo "One or more checks failed"
    exit 1
fi

echo "All checks passed"
exit 0
EOL

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "Pre-commit hook installed successfully!"
