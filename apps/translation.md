Update Your English File
Once you have your API Key, follow these steps to add a translation:

Open the English file named en located in apps\dashboard\src\lib\utils\translations\en.json.
Create an object with a name corresponding to the translation you wish to add. Example: "tabs": { "profile": "Profile", "landing_page": "Landing Page" }.
Now, navigate to the file where you want to insert the translation.
Import the translation function:
import { t } from '$lib/utils/functions/translations';

Locate the line where you want to add the translation and use the following syntax: $t('path to the value in the object'). Example: <p>{$t('tabs.profile')}</p> (This will output "Profile"). Note: $t('') returns a string.
Run the translate script
Once you've updated the English file, you need to update the other files. To do this, run a command. Firstly ensure you're still in the /apps/dashboard directory, then execute:

pnpm run script:translate

This command runs a script that updates the other translation files.