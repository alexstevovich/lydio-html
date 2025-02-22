const Config = { xmlCompliant: false };

export class Element {
    _classes;
    _id;
    _attributes;
    _parentElement;
    _elementId;
    _styles;

    constructor() {
        this._classes = new Set();
        this._id = null;
        this._attributes = {};
        this._parentElement = null;
        this._elementId = null;
        this._styles = [];
    }

    addClass(className) {
        this._classes.add(className);
        return this;       
    }

    cls(className) {
        return this.addClass(className);       
    }

    setId(value) {
        this._id = value
        return this;
    }

    id(value) {
        return this.setId(value);
    }

    setElid(value) {
        this._elid = value
        return this;
    }

    elid(value) {
        return this.setElid(value);
    }

    findElementByElementId(elementId) {
        if (this._elementId === elementId) return this;
        for (const child of this._slot || []) {
            const found = child.findElementByElementId?.(elementId);
            if (found) return found;
        }
        return null;
    }

    addAttribute(key, value = null) {
        this._attributes[key] = value;
        return this;
    }

    attr(key, value) {
        return this.addAttribute(key, value);
    }

    addStyle(prop, value) {
        this._styles.push(`${prop}: ${value}`);
        return this;
    }

    style(prop, value) {
        return  this.addStyle(prop, value);
    }

    getParent() {
        return this._parentElement;
    }

    parent() {
        return this.getParent();
    }

    getRoot() {
        let root = this;
        while (root._parentElement) {
            root = root._parentElement;
        }
        return root;
    }

    root() {
        return this.getRoot();
    }

    _renderAttributes() {
        let attrs = [];
        if (this._classes.size) attrs.push(`class="${Array.from(this._classes).join(" ")}"`);

        if (this._id) attrs.push(`id="${this._id}"`);

        // Handle styles before rendering attributes
        if (this._styles.length > 0 && !this._attributes["style"]) {
            this._attributes["style"] = this._styles.join("; ");
        }

        Object.entries(this._attributes).forEach(([key, value]) => {
            attrs.push(value !== null ? `${key}="${value}"` : key);
        });

        return attrs.length ? " " + attrs.join(" ") : "";
    }
}

class Slotable extends Element {
    _slot;

    constructor() {
        super();
        this._slot = [];
    }

    addAndGetTag(tagName) {
        const child = new Tag(tagName);
        child._parentElement = this;
        this._slot.push(child);
        return child;
    }

    tag(tagName) {
        return this.addAndGetTag(tagName)
    }

    addAndGetVoid(tagName) {
        const child = new Void(tagName);
        child._parentElement = this;
        this._slot.push(child);
        return child;
    }

    void(tagName) {
        return this.addAndGetVoid(tagName);
    }

    addAndGetBlock() {
        const child = new Block();
        child._parentElement = this;
        this._slot.push(child);
        return child;
    }

    block() {
        return this.addAndGetBlock();
    }

    addText(content) {
        this._slot.push(new Text(content));
        return this;
    }

    text(content) {
        return this.addText(content);
    }

    addElement(element) {
        element._parentElement = this;
        this._slot.push(element);
        return this;
    }

    add(element) {
        return this.addElement(element);
    }

    addAndGetElement(element) {
        this.addElement(element)
        return element;
    }

    addAndGet(element) {
        return this.addAndGetElement(element)
    }

}

export class Tag extends Slotable {
    _tagName;

    constructor(tagName) {
        super();
        this._tagName = tagName;
    }

    toHtml(options = {}) {
        const attrs = this._renderAttributes();
        const content = this._slot.map(el => el.toHtml(options)).join("");
        return `<${this._tagName}${attrs}>${content}</${this._tagName}>`;
    }
}

export class Void extends Element {
    _tagName;

    constructor(tagName) {
        super();
        this._tagName = tagName;
    }

    toHtml(options = {}) {
        const attrs = this._renderAttributes();
        return Config.xmlCompliant
            ? `<${this._tagName}${attrs}/>`
            : `<${this._tagName}${attrs}>`;
    }
}

export class Text {
    _content;

    constructor(content) {
        this._content = content;
    }

    toHtml(options = {}) {
        return this._content;
    }
}

export class Block extends Slotable {
    constructor() {
        super();
    }

    toHtml(options = {}) {
        return this._slot.map(el => el.toHtml(options)).join("");
    }
}