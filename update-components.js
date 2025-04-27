const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to recursively find all TypeScript and TSX files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update a file
function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Check if the file uses react-router-dom
  if (content.includes('react-router-dom')) {
    // Add 'use client' directive if not present
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      content = "'use client'\n\n" + content;
      updated = true;
    }
    
    // Replace react-router-dom imports with next/link
    content = content.replace(/import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"]/g, "import Link from 'next/link'");
    
    // Replace Link to= with Link href=
    content = content.replace(/<Link\s+to=/g, '<Link href=');
    
    // Replace useLocation with usePathname
    content = content.replace(/import\s*{\s*useLocation\s*}\s*from\s*['"]react-router-dom['"]/g, "import { usePathname } from 'next/navigation'");
    content = content.replace(/useLocation\(\)/g, 'usePathname()');
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

// Main function
function main() {
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFiles(srcDir);
  
  console.log(`Found ${files.length} files to check.`);
  
  files.forEach(file => {
    updateFile(file);
  });
  
  console.log('Update complete!');
}

main(); 