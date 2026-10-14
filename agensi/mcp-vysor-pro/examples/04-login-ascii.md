# Prompt: log in with ASCII credentials

Ask the agent:

> Focus the email field, type the address I give you, then the password field, then tap the login button. Credentials are ASCII only.

Expected sequence:

1. Screenshot and identify fields
2. Tap email, `adb_input_text`
3. Tap password, `adb_input_text`
4. Tap submit
5. Screenshot the result
6. If characters are accented, stop and ask the user to type them
