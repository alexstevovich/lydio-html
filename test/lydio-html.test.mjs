import { Tag, Void, Block } from '../src/index.mjs';

console.log("Running Lydio: HTML Tests...\n");

// Test 1: Basic Tag Creation
const div = new Tag('div')
    .cls('container')
    .attr('data-type', 'main')
    .style('color', 'red')
    .text('Hello, Lydio!');

console.log("Test 1 - Basic Tag Creation:");
console.log(div.toHtml());
console.log("Expected:");
console.log('<div class="container" data-type="main" style="color: red;">Hello, Lydio!</div>\n');

// Test 2: Nested Elements
const container = new Tag('div')
    .cls('main-container')
    .addAndGetTag('h1')
        .text('Welcome to Lydio')
    .parent()
    .addAndGetTag('p')
        .text('Generate HTML easily.');

console.log("Test 2 - Nested Elements:");
console.log(container.toHtml());
console.log("Expected:");
console.log(`<div class="main-container">
    <h1>Welcome to Lydio</h1>
    <p>Generate HTML easily.</p>
</div>\n`);

// Test 3: Self-Closing Elements (Void)
const img = new Void('img')
    .attr('src', 'logo.png')
    .attr('alt', 'Lydio Logo');

console.log("Test 3 - Self-Closing Elements (Void):");
console.log(img.toHtml());
console.log("Expected:");
console.log('<img src="logo.png" alt="Lydio Logo"> (or self-closing if XML compliant)\n');

// Test 4: Block with Multiple Root Elements
const block = new Block()
    .addAndGetTag('h2').text('Block Title').parent()
    .addAndGetTag('p').text('Block content goes here.');

console.log("Test 4 - Block with Multiple Root Elements:");
console.log(block.toHtml());
console.log("Expected:");
console.log(`<h2>Block Title</h2>
<p>Block content goes here.</p>\n`);

// Test 5: Parent Navigation
const nested = new Tag('div')
    .cls('outer')
    .addAndGetTag('section')
        .cls('inner')
        .addAndGetTag('p')
            .text('Inside paragraph')
        .parent()
    .parent();

console.log("Test 5 - Parent Navigation:");
console.log(nested.toHtml());
console.log("Expected:");
console.log(`<div class="outer">
    <section class="inner">
        <p>Inside paragraph</p>
    </section>
</div>\n`);

// Test Completion
console.log("\nAll tests completed. Manually verify outputs match expected results.");
