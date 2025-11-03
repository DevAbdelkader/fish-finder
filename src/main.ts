import './style.css'
import * as THREE from 'three'
import ModelLoader from './ModelLoader.js'

import gsap from 'gsap';
import SplitText from 'gsap/src/SplitText'
import ScrollTrigger from 'gsap/src/ScrollTrigger'
import ScrollSmoother from 'gsap/src/ScrollSmoother';
import ScrollToPlugin from 'gsap/src/ScrollToPlugin';


interface Taxonomy {
    kingdom?: string;
    phylum?: string;
    class?: string;
    order?: string;
    family?: string;
    [key: string]: any;
}

interface Stats {
    maxLength?: string;
    maxWeight?: string;
    speed?: string;
    habitat?: string;
    diet?: string;
    lifeSpan?: string;
    depthRange?: string;
    [key: string]: any;
}

interface Fish {
    id: string;
    name: string;
    category: string;
    img: string;
    badge: string;
    description: string;
    taxonomy: Taxonomy;
    stats: Stats;
    behaviour: string;
    quickInfo: string;
    model: string;
    [key: string]: any;
}

type ModelScene = {
    scene: THREE.Scene;
    controls: any;
    dispose: () => void;
    loadModel: (url?: string) => void;
    setupOrbitControls: () => void;
};

(function discoverCreature(): void {
    const SELECTOR = '#fish-selector';
    const DATA_URL = '/data/fish.json';
    
    const root = document.querySelector(SELECTOR) as HTMLElement;
    if (!root) return;

    const btn = root.querySelector('button') as HTMLButtonElement | null;
    const menu = document.getElementById('select-menu') as HTMLElement | null;
    const tabsEl = document.getElementById('tabs') as HTMLUListElement | null;
    const listEl = document.getElementById('fish-list') as HTMLUListElement | null;

    // Back
    const backBtn = document.getElementById('back-to-select') as HTMLButtonElement | null;

    // Creature View
    const creViewRoot = document.getElementById('creature-view') as HTMLElement | null;
    const creName = document.getElementById('creature-name') as HTMLElement | null;
    const creBdg = document.getElementById('creature-badge') as HTMLElement | null;
    const creDesc = document.getElementById('creature-desc') as HTMLElement | null;
    const creTaxonomy = document.getElementById('creature-taxonomy') as HTMLElement | null;
    const creStats = document.getElementById('creature-stats') as HTMLElement | null;
    const creBhvr = document.getElementById('creature-behavior') as HTMLElement | null;
    const creQInfo = document.getElementById('creature-quick-info') as HTMLElement | null;
    const modelCont = document.getElementById('version-2-model') as HTMLElement | null;
    let creatureModelScene: ModelScene | null = null;

    let fish: Fish[] = [];

    backBtn?.addEventListener('click', () => {
        void fadeOutExit();
    });

    function renderCreatureData(data?: Fish): void {
        if (!data) return;
        if (creName) creName.textContent = data.name ?? '';
        if (creBdg) creBdg.textContent = data.badge ?? '';
        if (creDesc) creDesc.textContent = data.description ?? '';

        // taxonomy list
        if (creTaxonomy) {
            creTaxonomy.innerHTML = '';
            const t: Taxonomy = data.taxonomy ?? {};
            const rows: Array<[string, string | undefined]> = [
                ['Kingdom', t.kingdom],
                ['Phylum', t.phylum],
                ['Class', t.class],
                ['Order', t.order],
                ['Family', t.family]
            ];
            rows.forEach(r => {
                if (r[1]) {
                    const li = document.createElement('li');
                    li.className = 'flex flex-col gap-0.5 p-2 break-all';
                    li.innerHTML = `
                                <div class="font-bold">${r[0]}</div>
                                <div>${r[1]}</div>
                            `;
                    creTaxonomy.appendChild(li);
                }
            });
        }

        // stats grid
        if (creStats) {
            creStats.innerHTML = '';
            const s: Stats = data.stats ?? {};
            const statItems: Array<[string, string | undefined]> = [
                ['Max Length', s.maxLength],
                ['Max Weight', s.maxWeight],
                ['Speed', s.speed],
                ['Habitat', s.habitat],
                ['Diet', s.diet],
                ['Life Span', s.lifeSpan],
                ['Depth', s.depthRange],
            ];
            statItems.forEach(si => {
                const div = document.createElement('div');
                div.className = 'col-span-1 p-2 rounded-md bg-black/10';
                const statTitle = document.createElement('div');
                statTitle.textContent = si[0];
                statTitle.className = 'uppercase font-koulen text-[15px] text-white/60';
                const statContent = document.createElement('div');
                statContent.textContent = si[1] ?? '';
                div.appendChild(statTitle);
                div.appendChild(statContent);
                creStats.appendChild(div);
            });
        }

        if (creBhvr) creBhvr.textContent = data.behaviour ?? '';
        if (creQInfo) creQInfo.textContent = data.quickInfo ?? '';

        clearScene();

        // animate into creature view first; once animation completes, load the model
        void fadeInActive().then(() => {
            // load model after the pane is visible to ensure container sizing is correct
            void loadCreatureModel(data.model);
        });
    }

    function clearScene() {
        creatureModelScene?.dispose();
        creatureModelScene = null;
    }

    function loadCreatureModel(url?: string): void {
        if (!modelCont) return;
        creatureModelScene = new ModelLoader(modelCont) as ModelScene;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        creatureModelScene.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
        directionalLight.position.set(10, 10, 10);
        creatureModelScene.scene.add(directionalLight);

        creatureModelScene?.setupOrbitControls();
        if (creatureModelScene.controls) {
            creatureModelScene.controls.enableZoom = false;
            creatureModelScene.controls.enablePan = false;
            creatureModelScene.controls.autoRotate = true;
            creatureModelScene.controls.enableDamping = true;
            creatureModelScene.controls.dampingFactor = 0.1;
        }

        creatureModelScene.loadModel(url);
    }

    function fadeInActive(): Promise<void> {
        if (typeof gsap === 'undefined' || !creViewRoot) {
            root.hidden = true;
            if (creViewRoot) creViewRoot.hidden = false;
            return Promise.resolve();
        }

        // prepare creature view offscreen/transparent (will be revealed only when its animation starts)
        gsap.set(creViewRoot, { opacity: 0, y: 20, scale: 2 });

        return new Promise((resolve) => {
            const tl = gsap.timeline({ defaults: { duration: .5, ease: 'power2.out' } });

            tl.to(root, {
                y: -20, opacity: 0, pointerEvents: 'none', onComplete: () => {
                    // hide selector after animation and clear inline props
                    root.hidden = true;
                    gsap.set(root, { clearProps: 'all' });
                }
            })

            // then animate creature view in (starts after the selector animation finishes)
            .to(creViewRoot, { y: 0, scale: 1, opacity: 1, onStart: () => { creViewRoot.hidden = false; } })

            // resolve when timeline completes
            .eventCallback('onComplete', () => resolve());
        });
    }

    function fadeOutExit(): Promise<void> {
        // animate from creature view back to selector
        if (typeof gsap === 'undefined') {
            root.hidden = false;
            if (creViewRoot) creViewRoot.hidden = true;
            clearScene();
            return Promise.resolve();
        }

        gsap.set(root, { opacity: 0, y: -20 });
        if (creViewRoot) creViewRoot.hidden = false;

        return new Promise((resolve) => {
            const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power2.inOut' } });

            tl.to(creViewRoot, {
                y: 20, opacity: 0, pointerEvents: 'none', onComplete: () => {
                    if (creViewRoot) creViewRoot.hidden = true;
                    if (creViewRoot) gsap.set(creViewRoot, { clearProps: 'all' });
                }
            })

            // only after the creature view is out, unhide and animate selector in
            .to(root, {
                y: 0, opacity: 1, pointerEvents: 'auto', onStart: () => {
                    root.hidden = false;
                }
            })

            // cleanup model scene after the entire transition finishes
            .call(clearScene)

            // resolve when timeline completes
            .eventCallback('onComplete', () => resolve());
        });
    }

    // Custom Select Box
    async function load(): Promise<void> {
        try {
            const res = await fetch(DATA_URL);
            fish = (await res.json()) as Fish[];
            renderList(fish);
            const categories = Array.from(new Set(fish.map(f => f.category))).sort();
            renderTabs(categories);
        } catch (err) {
            console.error('Failed to load fish data', err);
        }
    }

    function setOpen(open: boolean): void {
        root.setAttribute('aria-expanded', String(open));
        btn?.setAttribute('aria-expanded', String(open));
        if (!menu) return;
        menu.hidden = !open;
    }

    function createListItem(item: Fish): HTMLLIElement {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.setAttribute('role', 'option');
        li.dataset.id = item.id;
        li.dataset.name = item.name;
        li.dataset.category = item.category;

        const img = document.createElement('img');
        img.src = item.img ?? '';
        img.alt = item.name;
        img.loading = 'lazy';
        img.className = 'w-16 h-16 object-contain';

        const p = document.createElement('p');
        p.className = 'text-sm';
        p.textContent = item.name;

        li.appendChild(img);
        li.appendChild(p);

        li.addEventListener('click', () => selectItem(item));
        return li;
    }

    function renderList(items: Fish[]): void {
        if (!listEl) return;
        listEl.innerHTML = '';
        const fragment = document.createDocumentFragment();
        items.forEach(i => fragment.appendChild(createListItem(i)));
        listEl.appendChild(fragment);
    }

    function selectItem(item: Fish): void {
        // update selector dataset and label
        root.dataset.selectedId = item.id;
        root.dataset.selectedName = item.name;

        renderCreatureData(item);

        setOpen(false);
    }

    function renderTabs(categories: string[]): void {
        if (!tabsEl) return;
        tabsEl.innerHTML = '';
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'inline-block px-4 py-3 active';
        allBtn.textContent = 'All';
        allBtn.addEventListener('click', () => {
            setActiveTab(allBtn);
            renderList(fish);
        });
        const liAll = document.createElement('li'); liAll.appendChild(allBtn); tabsEl.appendChild(liAll);

        categories.forEach(cat => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'inline-block px-4 py-3 hover:text-white/80';
            b.textContent = cat;
            b.addEventListener('click', () => {
                setActiveTab(b);
                renderList(fish.filter(f => f.category.toLowerCase() === cat.toLowerCase()));
            });
            const li = document.createElement('li'); li.appendChild(b); tabsEl.appendChild(li);
        });
    }

    function setActiveTab(activeBtn: HTMLButtonElement): void {
        if (!tabsEl) return;
        tabsEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // Wire toggles
    btn?.addEventListener('click', (e) => { e.preventDefault(); setOpen(!!menu?.hidden); });

    // close menu when clicking outside
    document.addEventListener('click', (ev) => {
        if (!root.contains(ev.target as Node)) setOpen(false);
    });

    void load();
})();

(function scrollTriggerAnimation(): void {
    gsap.registerPlugin(SplitText, ScrollTrigger, ScrollSmoother, ScrollToPlugin);

    ScrollSmoother.create({
        smooth: 2,
        effects: true,
        smoothTouch: 0.1,
    });

    const anchors = document.querySelectorAll<HTMLAnchorElement>('.scroll-to');
    anchors.forEach(a => a.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        gsap.to(window, { duration: 1, scrollTo: {
            y: a.href.split("/").pop(),
            offsetY: 50
        }})
    }));

    const hero = document.getElementById('hero');
    const split = SplitText.create("#hero-title", { type: "words, chars" });

    const species = document.getElementById('species');
    const mission = document.getElementById('mission');
    const reachUs = document.getElementById('reach-us');

    const tl1 = gsap.timeline();

    tl1.from(hero, {
        duration: 1,
        scale: .7,
        opacity: .2
    }).from(split.chars, {
        y: 20,
        autoAlpha: 0.1,
        stagger: 0.05
    }).from("#hero > div > div > div, #hero > div > div > p", {
        opacity: 0,
        scale: .6
    })

    gsap.fromTo(species,
        { scale: 0.6, opacity: 0, transformOrigin: 'center center' },
        {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: species,
                start: 'top 80%',
                end: 'top 40%',
                scrub: 0.6,
            }
        }
    );

    gsap.fromTo("#mission *", {
        opacity: .2,
        y: 60
    }, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
                trigger: mission,
                start: 'top 30%',
                end: 'top 10%',
                scrub: 0.6,
            }
    })

    gsap.from(reachUs, {
        opacity: .2,
        duration: 1,
        scale: .8,
        scrollTrigger: reachUs
    })

})();