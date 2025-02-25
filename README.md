# @lydio/html

@lydio/html is a structured HTML generator for JavaScript, designed to provide a fluent and efficient way to create HTML elements programmatically. It enables a clean and expressive API.

## Features

-   Fluent API for defining HTML elements.
-   Supports nesting and dynamic content.
-   Clear distinction between elements (`Tag`), self-closing elements (`Void`), and blocks (`Block`).
-   Intuitive short-hand methods for efficiency: `.tag()`, `.void()`, `.block()`, `.cls()`, `.attr()`, `.style()`, `.text()`, `.parent()`, `.root()`.
-   Methods return appropriate values for fluent chaining (`this`) or element retrieval (`append`).

## Installation

```sh
npm install @lydio/html
```

## Usage

```js
import { Tag, Void, Block } from '@lydio/html';

const div = new Tag('div')
    .cls('container')
    .attr('data-type', 'main')
    .style('color', 'red')
    .text('Hello, Lydio!');

console.log(div.toHtml());
// Output: <div class="container" data-type="main" style="color: red;">Hello, Lydio!</div>
```

## Components

```js
import { Tag } from '@lydio/html';

class AwesomeHeader extends Tag {
    constructor(text) {
        super('div');
        this.cls('awesome-header').text(text);
    }
}

const body = new Tag('body');
body.append(new AwesomeHeader("Lydio HTML rocks!"));

console.log(body.toHtml());
```

## API

### Creating Elements

-   `.tag(tagName)`: Creates and returns a new tag.
-   `.void(tagName)`: Creates and returns a self-closing tag.
-   `.block()`: Creates and returns a block without a root wrapper.

### Adding and Retrieving Elements

-   `.add(element)`: Adds an element and returns `this` for chaining.
-   `.append(element)`: Adds an element and returns the appended element.

### Attributes and Styling

-   `.id(value)`: Sets the id.
-   `.cls(className)`: Adds a class.
-   `.attr(key, value)`: Adds an attribute.
-   `.style(prop, value)`: Adds inline CSS styles.

While `id`, `class`, and `style` are all technically attributes and can be added that way, it's preferred to treat these as first-class systems and set them with dedicated functions. This allows a much easier OOP approach when interacting with the core objects and opens up potential for post-processing tools to improve the output with new features.

### Text Content

-   `.text(content)`: Adds text content to the element.

### Parent and Root Access

-   `.parent()`: Returns the parent element.
-   `.root()`: Returns the root element of the structure.

### Rendering HTML

-   `.toHtml()`: Generates the final HTML string representation.

## Example Usage

```js
const container = new Tag('div')
    .cls('main-container')
    .tag('h1')
        .text('Welcome to Lydio')
    .parent()
    .tag('p')
        .text('Generate HTML easily.');

console.log(container.toHtml());
/* Output:
<div class="main-container">
    <h1>Welcome to Lydio</h1>
    <p>Generate HTML easily.</p>
</div>
*/
```

## License
MIT

## Branding & Authenticity
**Lydio is a project by Alex Stevovich.** The Lydio name, branding, and identity belong to its creator.

