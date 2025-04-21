// Script to generate basic icons for PWA
// You can run this with Node.js: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// Sizes for PWA icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons for each size
sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, size, size);
    
    // Draw a racing car icon 
    const padding = size * 0.2;
    const carWidth = size - (padding * 2);
    const carHeight = carWidth * 0.6;
    
    // Car body
    ctx.fillStyle = 'red';
    ctx.fillRect(padding, size / 2 - carHeight / 2, carWidth, carHeight);
    
    // Car windows
    ctx.fillStyle = '#111';
    ctx.fillRect(padding + carWidth * 0.2, size / 2 - carHeight / 2 + carHeight * 0.2, carWidth * 0.6, carHeight * 0.2);
    ctx.fillRect(padding + carWidth * 0.2, size / 2 - carHeight / 2 + carHeight * 0.6, carWidth * 0.6, carHeight * 0.2);
    
    // Car wheels
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(padding + carWidth * 0.25, size / 2 - carHeight / 2 + carHeight, carWidth * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(padding + carWidth * 0.75, size / 2 - carHeight / 2 + carHeight, carWidth * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw a race flag pattern at the bottom
    const flagSize = size * 0.1;
    ctx.fillStyle = 'white';
    for (let i = 0; i < size / flagSize; i += 2) {
        ctx.fillRect(i * flagSize, size - flagSize, flagSize, flagSize);
        ctx.fillRect((i + 1) * flagSize, size - 2 * flagSize, flagSize, flagSize);
    }
    
    // Create buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Save file
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`Created icon-${size}x${size}.png`);
});

console.log('All icons generated!');
console.log('If you don\'t have the canvas package installed, run: npm install canvas');
console.log('You can also create icons manually with any image editor and place them in the icons folder'); 