const styles = `
    :host {
        --font-regular: 400 1.1rem/1.1 -system-ui, sans-serif;
        --font-semi: 900 1.2rem/1.1 -system-ui, sans-serif;
        --font-bold: 900 1.5rem/1.1 -system-ui, sans-serif;
        --color-light: #e1e1e1;
        --color-accent: #ffc0cb;
        --spacing-s: 1rem;
        --spacing-m: 2rem;
        --spacing-l: 3rem;

        font: var(--font-bold);
        color: var(--color-light);
    }

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    .image-from-pexels__search {
        margin-bottom: var(--spacing-l);
        text-align: center;
    }

    .image-from-pexels__input-field,
    .image-from-pexels__button {
        padding: var(--spacing-s) var(--spacing-m);
        background: var(--color-light);
        font: var(--font-semi);
        border: none;
        border-radius: 2rem;
        outline: none;
    }

    .image-from-pexels__button {
        cursor: pointer;
        transition: all 180ms ease-in
    }

    .image-from-pexels__button:hover {
        background: var(--color-accent);
    }

    .image-from-pexels__button:active {
        transform: scale(.9);
    }

    .image-from-pexels__result {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .image-from-pexels__frame {
        margin-bottom: var(--spacing-l);
    }

    .image-from-pexels__image {
        max-height: 50vh;
        border-radius: 1rem;
    }

    .image-from-pexels__credits {
        display: none;
        flex-direction: column;
        align-items: center;
    }

    .image-from-pexels__credits.show {
        display: flex;
    }

    .image-from-pexels__photographer,
    .image-from-pexels__pexels {
        display: block;
        cursor: pointer;
    }

    .image-from-pexels__photographer {
        margin-bottom: var(--spacing-s);
        font: var(--font-regular);
        color: var(--color-light);
        text-decoration: none;
        transition: color 180ms ease-in
    }

    .image-from-pexels__photographer:hover {
        color: var(--color-accent);
    }

    .image-from-pexels__pexels {
        width: 5rem;
    }
`

const template =  `
    <style>${styles}</style>

    <div class="image-from-pexels">

        <div class="image-from-pexels__search">
            <label class="image-from-pexels__input">
                <h1 class="image-from-pexels__input-title">What do you want to see?</h1>
                <input class="image-from-pexels__input-field" type="text">
            </label>

            <button class="image-from-pexels__button">Show me</button>
        </div>

        <div class="image-from-pexels__result">
            <div class="image-from-pexels__frame">
                <img class="image-from-pexels__image"/>
            </div>
            <div class="image-from-pexels__credits">
                <a class="image-from-pexels__photographer target="_blank" />
                <a class="image-from-pexels__pexels" href="https://www.pexels.com" target="_blank">
                    <img src="https://images.pexels.com/lib/api/pexels-white.png" />
                </a>
            </div>
        </div>
    </div>
`

class ImageFromPexels extends HTMLElement {
    constructor() {
        super();

        this._apiKey = '563492ad6f917000010000014696f6e492df4d048359f84a5e7fbc4c';
        this._apiUrl = 'https://api.pexels.com/v1';
        this._query = null;
        this._touched = false;
        this._root = this.attachShadow({ 'mode': 'open' });
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this._root.innerHTML = template;

        this.addListeners();
    }

    addListeners() {
        const input = this._root.querySelector('.image-from-pexels__input-field');
        const button = this._root.querySelector('.image-from-pexels__button');

        input.addEventListener("keyup", (event) => {
            if (event.keyCode === 13) {
                button.click();
            }
        });

        button.addEventListener('click', () => {
            if(!input.value) {
                return;
            }

            this._query = input.value;
            this.fetchData(input.value);
        })


    }

    async fetchData(value = '') {
        try {
            const response = await fetch(`${this._apiUrl}/search?query=${value}&per_page=1`, {
                headers: {
                    Authorization: this._apiKey
                }
            });
            const result = await response.json();

            if(result.total_results > 0 ) {
                this.renderImageAndCredits(result);
                return;
            }

            this.renderNoresults();

        } catch (error) {
            console.error(error);
        }
    }

    renderImageAndCredits(result = {}) {
        const imageSrc = result.photos[0].src.large;
        const photographerName = result.photos[0].photographer;
        const photographerUrl = result.photos[0].photographer_url;

        const image = this._root.querySelector('.image-from-pexels__image');
        const photographer = this._root.querySelector('.image-from-pexels__photographer');

        image.setAttribute('src', imageSrc);
        image.setAttribute('alt', this._query);

        photographer.setAttribute('href', photographerUrl);
        photographer.textContent = `Photo by ${photographerName} on Pexels`;

        if(!this._touched) {
            this.renderCredits();
            this._touched = true;
        }
    }

    renderNoresults() {
        console.log('No results!');
    }

    renderCredits() {
        this._root.querySelector('.image-from-pexels__credits').classList.add('show');
    }
}

customElements.define("image-from-pexels", ImageFromPexels);