const Global = { xmlCompliantDefault: false };

const SELF_CLOSING_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
]);


function _sanitizeText(input) {
    // Offline basic sanitization: Strip <script>, <iframe>, and similar tags
    return input.replace(/<\/?(script|iframe|object|embed|link|meta|style|form|input|textarea|button)[^>]*>/gi, "");
}

function escapeHtml(str) {
    if (typeof str !== "string") {
        str = String(str); // Convert to string explicitly
    }
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
}

class Issue
{
    constructor(element,message)
    {
        this.id = element.nodeId;
        this.type = element.nodeType;
        this.message = message;
    }

    toString() {
        return `[Issue] ${this.type}${this.id ? `#${this.id}` : ''} → ${this.message}`;
    }
    
}

class AuditContext {
    constructor() {
        this.issues = [];
    }

    issue(obj) {
        this.issues.push(obj);
    }

    hasIssues() {
        return this.issues.length > 0;
    }

    length() {
        return this.issues.length;
    }
}



class Node {
    _parentElement;
    _nodeId;
    /**
     * Defines the type of this node.
     * 
     * - This should only be overridden in subclasses.
     * - Do **not** attempt to set this dynamically at runtime.
     * 
     * Example usage in a subclass:
     * ```js
     * class CustomNode extends Node {
     *   static get nodeType() { return 'custom-node'; }
     * }
     * ```
     */
    static get nodeType() { return 'node'; }

    constructor() {
        this._parentElement = null;
        this._nodeId = null;
    }
    
    get nodeType() {
        return this.constructor.nodeType
    }

    get nodeId() {
        return this._nodeId;
    }

    nid(value) {
        this._nodeId = value;
        return this;
    }

    parent() {
        return this._parentElement;
    }

    root() {
        return this.getRoot();
    }

    error(message) {
        throw new Error(`[Lydio Error]: `+message);
    }

}

const ContainerMixin = Base => class extends Base {
    constructor() {
        super();
        this._children = [];
    }

    append(element) {
        element._parentElement = this;
        this._children.push(element);
        return element;
    }

    leaf(tagName) {
        const child = new Leaf({ tagName });
        return this.append(child);
    }

    tag(tagName) {
        const child = new Tag({ tagName });
        return this.append(child);
    }

    fragment() {
        const child = new Fragment();
        return this.append(child);
    }

    raw(content) {
        this.append(new Raw(content));
        return this;
    }

    text(content) {
        this.append(new Text(content));
        return this;
    }

    doctype(type = "html") {
        const child = new Doctype(type);
        return this.append(child);
    }

    _audit(context) {
        super._audit?.(context);
        for (const child of this._children) {
            if (typeof child._audit === 'function') {  // ✅ Ensures `_audit()` exists
                child._audit(context);
            }
        }
    }
};


const AttributableMixin = Base => class extends Base {
    constructor() {
        super();
        this._classes = new Set();
        this._attributes = {};
        this._styles = [];
        this._id = null;
    }

    cls(className) {
        this._classes.add(className);
        return this;
    }

    precls(prefix,className) {
        this.cls(className);
        if (prefix) this.cls(prefix + className);
        return this;
    }

    id(value) {
        this._id = value;
        return this;
    }

    attr(key, value = null) {
        this._attributes[key] = value;
        return this;
    }

    style(prop, value) {
        this._styles.push(`${prop}: ${value}`);
        return this;
    }

    _renderAttributes() {
        let attrs = [];
    
        if (this._classes.size) {
            attrs.push(`class="${Array.from(this._classes).join(" ")}"`);
        }
        if (this._id) {
            attrs.push(`id="${this._id}"`);
        }
        if (this._styles.length) {
            this._attributes["style"] = this._styles.join("; ");
        }
    
        for (const [key, value] of Object.entries(this._attributes)) {
            if (value === null) {
                attrs.push(key);
            } else {
                attrs.push(`${key}="${escapeHtml(value)}"`);
            }
        }
    
        return attrs.length ? " " + attrs.join(" ") : "";
    }
    
};


const AuditableMixin = Base => class extends Base {
    audit() {
        const context = new AuditContext();
        this._audit(context);
        return context;
    }

    validate() {
        return !this.audit().hasIssues();
    }

    debugValidate() {
        const context = this.audit();
        if (context.hasIssues()) {
            console.warn(`[Lydio:Audit] Found ${context.length()} issue`)
            context.issues.forEach((issue)=>
                {                    
                    console.warn(`[Lydio:Audit]: ${issue.toString()}`);
                })
        }
        else
        {
            //Makes to much spam for large projects:
            //console.info(`[Lydio:Audit] Success!`);
        }
        return !context.hasIssues();
    }
};

const ElementMixin = Base => class extends Base {
    constructor() {
        super();
        this._tagName = null;
    }

    setTagName(tagName) {
        if (typeof tagName !== "string" || !tagName.trim()) {
            throw new Error("[Lydio:Taggable] Invalid tag name.");
        }
        this._tagName = tagName;
        return this;
    }

    getTagName() {
        return this._tagName;
    }

    isTagNameValid(){
        if (typeof this._tagName !== "string" || this._tagName.trim() === "") {
            return false;
        }
        return true;
    }
    
    auditTagName(context)
    {
        if(!this.isTagNameValid())
        {
            context.issue(new Issue(this,'Tag name is required but was not set.'));
        }
    }

    ensureTagName() {
        if(!this.isTagNameValid())
        {
            throw new Error(`[Lydio:Taggable] Tag name is required but was not set.`);
        }
    }
};


class Tag extends AuditableMixin(AttributableMixin(ContainerMixin(ElementMixin(Node)))) {

    static get nodeType() { return 'tag'; }

    constructor({ tagName = null } = {}) {
        super();
        if (tagName) {
            this.setTagName(tagName);
        }
    }

    _audit(context) {
        super._audit?.(context);

        this.auditTagName(context)
        if (SELF_CLOSING_TAGS.has(this._tagName)) {
            context.issue(new Issue(this,`${this._tagName} should not be a self-closing tag. Use 'void()' instead.`));
        }
    }

    toHtml() {
        this.ensureTagName()
        const attrs = this._renderAttributes();
        const content = this._children.reduce((html, el) => html + el.toHtml(), "");
        return `<${this._tagName}${attrs}>${content}</${this._tagName}>`;
    }
}


class Fragment extends AuditableMixin(ContainerMixin(Node)) {

    static get nodeType() { return 'fragment'; }

    constructor() {
        super();
    }

    toHtml() {
        return this._children.reduce((html, el) => html + el.toHtml(), "");
    }
}


class Leaf extends AuditableMixin(AttributableMixin(ElementMixin(Node))) {

    static get nodeType() { return 'leaf'; }

    constructor({ tagName = null } = {}) {
        super();
        if (tagName) {
            this.setTagName(tagName);
        }
    }

    _audit(context) {
        super._audit?.(context);
        this.auditTagName(context)
        if (!SELF_CLOSING_TAGS.has(this._tagName)) {
           context.issue(new Issue(this,`${this._tagName} is not a valid self-closing tag.`));
        }
    }

    toHtml({xmlCompliant = Global.xmlCompliantDefault}={}) {
        this.ensureTagName()
        const attrs = this._renderAttributes();
        return xmlCompliant
            ? `<${this._tagName}${attrs}/>`
            : `<${this._tagName}${attrs}>`;
    }
}


class Text extends Node {
    _content;

    static get nodeType() { return 'text'; }

    constructor(content) {
        super();
        this.set(content)
    }

    set(content) {
        this._content = _sanitizeText(content);
        return this;
    }

    toHtml() {
        return escapeHtml(this._content);
    }
}

class Raw extends Node {
    _content;

    static get nodeType() { return 'raw'; }

    constructor(content) {
        super();
        this._content = content;
        return this
    }

    set(content) {
        this._content = content;
    }


    toHtml() {
        return this._content;
    }
}


const VALID_DOCTYPES = new Set(["html", "xhtml", "transitional", "strict", "frameset"]);

class Doctype extends AuditableMixin(Node) {
    _type;
    _force;

    static get nodeType() { return 'doctype'; }

    constructor(type = "html", { force = false } = {}) {
        super();
        this._type = type;
        this._force = force;
    }

    _audit(context) {
        super._audit?.(context);

        if (!this._force && !VALID_DOCTYPES.has(this._type)) {
            context.issue(new Issue(this,`Invalid DOCTYPE: ${this._type}. Use a valid one or set force: true.`));
        }
    }

    toHtml() {
        return `<!DOCTYPE ${this._type}>`;
    }
}



export { Global,Tag, Leaf, Fragment };
export default  {Global, Tag, Leaf, Fragment };