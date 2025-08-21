
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const configsDir = 'config';
const schemasDir = 'schemas';

const configFiles = fs.readdirSync(configsDir).filter(f => f.endsWith('.json'));

let allValid = true;

console.log('--- Running QuestBox Config Validation ---');

configFiles.forEach(file => {
  const configPath = path.join(configsDir, file);
  const schemaPath = path.join(schemasDir, file.replace('.json', '.schema.json'));
  
  if (!fs.existsSync(schemaPath)) {
    console.log(`[SKIP] No schema found for ${file}`);
    return;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    
    const validate = ajv.compile(schema);
    const valid = validate(config);
    
    if (valid) {
      console.log(`[PASS] ${file}`);
    } else {
      allValid = false;
      console.error(`[FAIL] ${file}`);
      console.error(validate.errors);
    }
  } catch (error) {
    allValid = false;
    console.error(`[ERROR] Could not process ${file}:`, error.message);
  }
});

console.log('--- Validation Complete ---');

if (!allValid) {
  console.error('\nOne or more configuration files failed validation.');
  process.exit(1);
} else {
  console.log('\nAll configuration files are valid!');
  process.exit(0);
}
