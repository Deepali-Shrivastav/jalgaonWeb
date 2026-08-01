const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // We will look for <img ... /> tags
    // A regex to match <img ... >
    const imgRegex = /<img\s+([^>]+)>/g;

    content = content.replace(imgRegex, (match, attrs) => {
        // Find src={...} or src="..."
        const srcMatch = attrs.match(/src=\{([^}]+)\}/) || attrs.match(/src="([^"]+)"/);
        // Find alt={...} or alt="..."
        const altMatch = attrs.match(/alt=\{([^}]+)\}/) || attrs.match(/alt="([^"]+)"/);

        if (srcMatch && altMatch) {
            let srcVal = srcMatch[1];
            let altVal = altMatch[1];

            // Try to extract object.property from srcVal
            // e.g. businessData.business_banner or item.image
            const objPropMatch = srcVal.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+(image|img|banner|logo|photo|pic)[a-zA-Z0-9_]*)/i);

            if (objPropMatch) {
                const obj = objPropMatch[1];
                const prop = objPropMatch[2];
                const altProp = `${prop}_alt`;
                const newAltProp = `${obj}.${altProp}`;

                // If it already contains the altProp, skip
                if (altVal.includes(altProp)) {
                    return match;
                }

                // Construct new alt
                // If original alt was a string literal like "image", keep it as fallback
                let originalAltExpr = altVal;
                if (attrs.match(/alt="([^"]+)"/)) {
                    originalAltExpr = `"${altVal}"`;
                }

                const newAlt = `{${newAltProp} || ${originalAltExpr}}`;

                // Replace the old alt with the new alt
                const newAttrs = attrs.replace(/alt=(?:\{[^}]+\}|"[^"]+")/, `alt=${newAlt}`);
                modified = true;
                return `<img ${newAttrs}>`;
            }
        }
        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

const targetDir = path.join(__dirname, 'jalgaonUi', 'src');
console.log(`Scanning ${targetDir}...`);
if (fs.existsSync(targetDir)) {
    walkDir(targetDir);
    console.log("Done updating React templates.");
} else {
    console.log("Target directory not found:", targetDir);
}
