
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = "http://localhost:35729/livereload.js?snipv"; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const RouteStateHistory = writable([]);
    var RouteStateHistory$1 = {
        subscribe: RouteStateHistory.subscribe,
        add(state) {
            RouteStateHistory.update((states) => {
                states.push(state);
                return states;
            });
        },
        reset() {
            RouteStateHistory.set([]);
        },
    };

    /* src\pages\LoadingPage.svelte generated by Svelte v3.37.0 */

    function create_fragment$o(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading app!");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoadingPage", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoadingPage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LoadingPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoadingPage",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    const CurrentRoute = writable({
        url: '',
        queryParams: {},
        urlParams: {},
        visibleComponent: LoadingPage,
        componentProperties: {},
        state: 'ok'
    });
    var CurrentRoute$1 = {
        subscribe: CurrentRoute.subscribe,
        set: (newRoute) => {
            RouteStateHistory$1.add(newRoute);
            CurrentRoute.set(newRoute);
        }
    };

    /* src\components\router\RouterViewport.svelte generated by Svelte v3.37.0 */
    const file$i = "src\\components\\router\\RouterViewport.svelte";

    function create_fragment$n(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	const switch_instance_spread_levels = [/*$CurrentRoute*/ ctx[0]?.componentProperties];
    	var switch_value = /*$CurrentRoute*/ ctx[0].visibleComponent;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "router-viewport svelte-a4c5fd");
    			add_location(div, file$i, 13, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*$CurrentRoute*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*$CurrentRoute*/ ctx[0]?.componentProperties)])
    			: {};

    			if (switch_value !== (switch_value = /*$CurrentRoute*/ ctx[0].visibleComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $CurrentRoute;
    	validate_store(CurrentRoute$1, "CurrentRoute");
    	component_subscribe($$self, CurrentRoute$1, $$value => $$invalidate(0, $CurrentRoute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RouterViewport", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RouterViewport> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CurrentRoute: CurrentRoute$1, $CurrentRoute });
    	return [$CurrentRoute];
    }

    class RouterViewport extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RouterViewport",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    const LightInterfaceTheme = {
        name: 'light',
        title: 'Light Theme',
        variables: {
            // Main color
            "secondary-color": "#407076",
            "secondary-color-75": "#DA2F49",
            "secondary-color-50": "#E36376",
            "secondary-color-25": "#f7c7ce",
            "text-on-secondary-color": "#f8f8f8",
            /* // Secondary color
             "main-color": "#003D5B",
             "main-color-75": "#006DA3",
             "main-color-50": "#126B97",
             "main-color-25": "#CEDFE8",
             "text-on-main-color": "#f8f8f8",*/
            "main-color": "#5A0002",
            "main-color-75": "rgba(32,32,32,0.75)",
            "main-color-50": "rgba(32,32,32,0.5)",
            "main-color-25": "rgba(32,32,32,0.25)",
            "text-on-main-color": "#f8f8f8",
            // Background color
            "background-color": '#f5f5f5',
            "transparent-background-90": 'rgba(255,255,255,0.9)',
            "transparent-background-80": 'rgba(255,255,255,0.8)',
            "transparent-background-70": 'rgba(255,255,255,0.7)',
            "transparent-background-60": 'rgba(255,255,255,0.6)',
            "transparent-background-50": 'rgba(255,255,255,0.5)',
            "transparent-background-40": 'rgba(255,255,255,0.4)',
            "transparent-background-30": 'rgba(255,255,255,0.3)',
            "text-on-background-color": "#202020",
            "border-radius": "4px",
            // Box shadow
            "default-box-shadow": '0px 4px 6px -4px rgba(0,0,0,0.6)',
            "box-shadow-1": '0px 4px 6px -4px rgba(0,0,0,0.8)',
            "box-shadow-2": '0px 7px 6px -5px rgba(0,0,0,0.6)',
            "box-shadow-3": '1px 7px 8px -4px rgba(0,0,0,0.5)',
            "box-shadow-4": '1px 1px 8px -4px rgba(0,0,0,0.4)',
        }
    };

    const DefaultTheme = LightInterfaceTheme;

    const CurrentTheme = writable(DefaultTheme);

    /* src\themes\ThemeApplier.svelte generated by Svelte v3.37.0 */

    const { Object: Object_1 } = globals;

    function create_fragment$m(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $CurrentTheme;
    	validate_store(CurrentTheme, "CurrentTheme");
    	component_subscribe($$self, CurrentTheme, $$value => $$invalidate(0, $CurrentTheme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ThemeApplier", slots, ['default']);
    	
    	let theme;

    	afterUpdate(() => {
    		document.body.classList.forEach(i => {
    			if (i.match(/theme-.*/)) {
    				document.body.classList.remove(i);
    			}
    		});

    		document.body.classList.add("theme-" + theme.name);

    		if (document.body.querySelector("style.theme-" + theme.name) != null) {
    			return;
    		}

    		let styleNode = document.createElement("style");
    		styleNode.classList.add("theme-" + theme.name);

    		styleNode.innerHTML = `
    body.theme-${theme.name} {
      ${Object.entries(theme.variables).map(([key, value]) => {
			return `--${key}: ${value};`;
		}).join("\n")}
    }
    `;

    		document.body.append(styleNode);
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ThemeApplier> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		CurrentTheme,
    		theme,
    		$CurrentTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) theme = $$props.theme;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$CurrentTheme*/ 1) {
    			theme = $CurrentTheme;
    		}
    	};

    	return [$CurrentTheme, $$scope, slots];
    }

    class ThemeApplier extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ThemeApplier",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    // (5:0) <ThemeApplier>
    function create_default_slot$7(ctx) {
    	let routerviewport;
    	let current;
    	routerviewport = new RouterViewport({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(routerviewport.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(routerviewport, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(routerviewport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(routerviewport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(routerviewport, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(5:0) <ThemeApplier>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let themeapplier;
    	let current;

    	themeapplier = new ThemeApplier({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(themeapplier.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(themeapplier, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const themeapplier_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				themeapplier_changes.$$scope = { dirty, ctx };
    			}

    			themeapplier.$set(themeapplier_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(themeapplier.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(themeapplier.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(themeapplier, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ RouterViewport, ThemeApplier });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /**
     * Tokenize input string.
     */
    function lexer(str) {
        var tokens = [];
        var i = 0;
        while (i < str.length) {
            var char = str[i];
            if (char === "*" || char === "+" || char === "?") {
                tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
                continue;
            }
            if (char === "\\") {
                tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
                continue;
            }
            if (char === "{") {
                tokens.push({ type: "OPEN", index: i, value: str[i++] });
                continue;
            }
            if (char === "}") {
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
                continue;
            }
            if (char === ":") {
                var name = "";
                var j = i + 1;
                while (j < str.length) {
                    var code = str.charCodeAt(j);
                    if (
                    // `0-9`
                    (code >= 48 && code <= 57) ||
                        // `A-Z`
                        (code >= 65 && code <= 90) ||
                        // `a-z`
                        (code >= 97 && code <= 122) ||
                        // `_`
                        code === 95) {
                        name += str[j++];
                        continue;
                    }
                    break;
                }
                if (!name)
                    throw new TypeError("Missing parameter name at " + i);
                tokens.push({ type: "NAME", index: i, value: name });
                i = j;
                continue;
            }
            if (char === "(") {
                var count = 1;
                var pattern = "";
                var j = i + 1;
                if (str[j] === "?") {
                    throw new TypeError("Pattern cannot start with \"?\" at " + j);
                }
                while (j < str.length) {
                    if (str[j] === "\\") {
                        pattern += str[j++] + str[j++];
                        continue;
                    }
                    if (str[j] === ")") {
                        count--;
                        if (count === 0) {
                            j++;
                            break;
                        }
                    }
                    else if (str[j] === "(") {
                        count++;
                        if (str[j + 1] !== "?") {
                            throw new TypeError("Capturing groups are not allowed at " + j);
                        }
                    }
                    pattern += str[j++];
                }
                if (count)
                    throw new TypeError("Unbalanced pattern at " + i);
                if (!pattern)
                    throw new TypeError("Missing pattern at " + i);
                tokens.push({ type: "PATTERN", index: i, value: pattern });
                i = j;
                continue;
            }
            tokens.push({ type: "CHAR", index: i, value: str[i++] });
        }
        tokens.push({ type: "END", index: i, value: "" });
        return tokens;
    }
    /**
     * Parse a string for the raw tokens.
     */
    function parse(str, options) {
        if (options === void 0) { options = {}; }
        var tokens = lexer(str);
        var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
        var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
        var result = [];
        var key = 0;
        var i = 0;
        var path = "";
        var tryConsume = function (type) {
            if (i < tokens.length && tokens[i].type === type)
                return tokens[i++].value;
        };
        var mustConsume = function (type) {
            var value = tryConsume(type);
            if (value !== undefined)
                return value;
            var _a = tokens[i], nextType = _a.type, index = _a.index;
            throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
        };
        var consumeText = function () {
            var result = "";
            var value;
            // tslint:disable-next-line
            while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
                result += value;
            }
            return result;
        };
        while (i < tokens.length) {
            var char = tryConsume("CHAR");
            var name = tryConsume("NAME");
            var pattern = tryConsume("PATTERN");
            if (name || pattern) {
                var prefix = char || "";
                if (prefixes.indexOf(prefix) === -1) {
                    path += prefix;
                    prefix = "";
                }
                if (path) {
                    result.push(path);
                    path = "";
                }
                result.push({
                    name: name || key++,
                    prefix: prefix,
                    suffix: "",
                    pattern: pattern || defaultPattern,
                    modifier: tryConsume("MODIFIER") || ""
                });
                continue;
            }
            var value = char || tryConsume("ESCAPED_CHAR");
            if (value) {
                path += value;
                continue;
            }
            if (path) {
                result.push(path);
                path = "";
            }
            var open = tryConsume("OPEN");
            if (open) {
                var prefix = consumeText();
                var name_1 = tryConsume("NAME") || "";
                var pattern_1 = tryConsume("PATTERN") || "";
                var suffix = consumeText();
                mustConsume("CLOSE");
                result.push({
                    name: name_1 || (pattern_1 ? key++ : ""),
                    pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                    prefix: prefix,
                    suffix: suffix,
                    modifier: tryConsume("MODIFIER") || ""
                });
                continue;
            }
            mustConsume("END");
        }
        return result;
    }
    /**
     * Create path match function from `path-to-regexp` spec.
     */
    function match(str, options) {
        var keys = [];
        var re = pathToRegexp(str, keys, options);
        return regexpToFunction(re, keys, options);
    }
    /**
     * Create a path match function from `path-to-regexp` output.
     */
    function regexpToFunction(re, keys, options) {
        if (options === void 0) { options = {}; }
        var _a = options.decode, decode = _a === void 0 ? function (x) { return x; } : _a;
        return function (pathname) {
            var m = re.exec(pathname);
            if (!m)
                return false;
            var path = m[0], index = m.index;
            var params = Object.create(null);
            var _loop_1 = function (i) {
                // tslint:disable-next-line
                if (m[i] === undefined)
                    return "continue";
                var key = keys[i - 1];
                if (key.modifier === "*" || key.modifier === "+") {
                    params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
                        return decode(value, key);
                    });
                }
                else {
                    params[key.name] = decode(m[i], key);
                }
            };
            for (var i = 1; i < m.length; i++) {
                _loop_1(i);
            }
            return { path: path, index: index, params: params };
        };
    }
    /**
     * Escape a regular expression string.
     */
    function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
    }
    /**
     * Get the flags for a regexp from the options.
     */
    function flags(options) {
        return options && options.sensitive ? "" : "i";
    }
    /**
     * Pull out keys from a regexp.
     */
    function regexpToRegexp(path, keys) {
        if (!keys)
            return path;
        var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
        var index = 0;
        var execResult = groupsRegex.exec(path.source);
        while (execResult) {
            keys.push({
                // Use parenthesized substring match if available, index otherwise
                name: execResult[1] || index++,
                prefix: "",
                suffix: "",
                modifier: "",
                pattern: ""
            });
            execResult = groupsRegex.exec(path.source);
        }
        return path;
    }
    /**
     * Transform an array into a regexp.
     */
    function arrayToRegexp(paths, keys, options) {
        var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
        return new RegExp("(?:" + parts.join("|") + ")", flags(options));
    }
    /**
     * Create a path regexp from string input.
     */
    function stringToRegexp(path, keys, options) {
        return tokensToRegexp(parse(path, options), keys, options);
    }
    /**
     * Expose a function for taking tokens and returning a RegExp.
     */
    function tokensToRegexp(tokens, keys, options) {
        if (options === void 0) { options = {}; }
        var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
        var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
        var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
        var route = start ? "^" : "";
        // Iterate over the tokens and create our regexp string.
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (typeof token === "string") {
                route += escapeString(encode(token));
            }
            else {
                var prefix = escapeString(encode(token.prefix));
                var suffix = escapeString(encode(token.suffix));
                if (token.pattern) {
                    if (keys)
                        keys.push(token);
                    if (prefix || suffix) {
                        if (token.modifier === "+" || token.modifier === "*") {
                            var mod = token.modifier === "*" ? "?" : "";
                            route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                        }
                        else {
                            route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                        }
                    }
                    else {
                        route += "(" + token.pattern + ")" + token.modifier;
                    }
                }
                else {
                    route += "(?:" + prefix + suffix + ")" + token.modifier;
                }
            }
        }
        if (end) {
            if (!strict)
                route += delimiter + "?";
            route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
        }
        else {
            var endToken = tokens[tokens.length - 1];
            var isEndDelimited = typeof endToken === "string"
                ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
                : // tslint:disable-next-line
                    endToken === undefined;
            if (!strict) {
                route += "(?:" + delimiter + "(?=" + endsWith + "))?";
            }
            if (!isEndDelimited) {
                route += "(?=" + delimiter + "|" + endsWith + ")";
            }
        }
        return new RegExp(route, flags(options));
    }
    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     */
    function pathToRegexp(path, keys, options) {
        if (path instanceof RegExp)
            return regexpToRegexp(path, keys);
        if (Array.isArray(path))
            return arrayToRegexp(path, keys, options);
        return stringToRegexp(path, keys, options);
    }

    class HashRouter {
        constructor(preppendToURL = "/") {
            this._paused = false;
            this._triggerChange = true;
            this._hashSanitizer = (hash) => {
                return hash.trim().substr(1).replace(new RegExp("^" + this._preppendToURL, "gi"), "");
            };
            this._changeListeners = [];
            this._preppendToURL = preppendToURL.trim();
            this._currentURL = this._hashSanitizer(window.location.hash);
            window.addEventListener("hashchange", this.hashChangedHandler.bind(this));
        }
        hashChangedHandler() {
            if (this._paused)
                return;
            let newURL = this._hashSanitizer(window.location.hash);
            this._currentURL = newURL;
            if (this._triggerChange) {
                this.callChangeListeners(newURL);
            }
            else {
                console.debug("URL changed but 'triggerChange' prevented router from calling change listeners!");
            }
        }
        callChangeListeners(url) {
            this._changeListeners.forEach((listener) => listener(url !== null && url !== void 0 ? url : this.currentURL()));
        }
        offURLChange(fn) {
            this._changeListeners = this._changeListeners.filter((f) => f !== fn);
        }
        onURLChange(fn, once) {
            if (once === true) {
                let onceListener = (newURL) => {
                    fn(newURL);
                    this.offURLChange(onceListener);
                };
                this._changeListeners.push((onceListener));
            }
            else {
                this._changeListeners.push(fn);
            }
        }
        currentURL() {
            return this._currentURL;
        }
        changeURL(url, triggerURLChange) {
            this._triggerChange = triggerURLChange !== null && triggerURLChange !== void 0 ? triggerURLChange : true;
            window.location.hash = this._preppendToURL + url;
            this._triggerChange = true;
        }
        pause() {
            this._paused = true;
        }
        resume() {
            this._paused = false;
        }
        setPausedState(paused) {
            this._paused = paused;
        }
    }

    const DefaultRoutingStrategy = new HashRouter();
    class Router {
        constructor() {
            this.routes = [];
            this._started = false;
            this.strategy = DefaultRoutingStrategy;
            this.routeChangedHandler = async (newURL) => {
                var _a;
                let activateRoute = null;
                let urlParams = {};
                let pureURL = this.stripQueryString(newURL);
                for (let tryRoute of this.routes) {
                    const urlMatches = match(tryRoute.url_pattern);
                    let matches = urlMatches(pureURL);
                    if (matches) {
                        urlParams = matches.params;
                        activateRoute = tryRoute;
                        break;
                    }
                }
                if (activateRoute === null) {
                    this.routeNotFound(newURL);
                    return;
                }
                let queryParams = (_a = this.extractQueryString(newURL)) !== null && _a !== void 0 ? _a : {};
                if (activateRoute.guard != null) {
                    let authorized = false;
                    if (Array.isArray(activateRoute.guard)) {
                        for (let guardFn of activateRoute.guard) {
                            let isAuthorized = await guardFn(pureURL, urlParams, queryParams);
                            if (!isAuthorized) {
                                authorized = false;
                                break;
                            }
                        }
                    }
                    else {
                        authorized = await activateRoute.guard(pureURL, urlParams, queryParams);
                    }
                    if (!authorized) {
                        this.routeGuarded(activateRoute);
                        return;
                    }
                }
                if (this._currentRoute != null &&
                    this._currentRoute.onDeactivation != null) {
                    let canProceed = await this._currentRoute.onDeactivation();
                    if (!canProceed) {
                        return;
                    }
                }
                if (Array.isArray(activateRoute.onActivation)) {
                    for (let activationStep of activateRoute.onActivation) {
                        await activationStep({
                            url: pureURL,
                            urlParams: Object.assign({}, urlParams),
                            queryParams: Object.assign({}, queryParams)
                        });
                    }
                }
                else {
                    await activateRoute.onActivation({
                        url: pureURL,
                        urlParams: Object.assign({}, urlParams),
                        queryParams: Object.assign({}, queryParams)
                    });
                }
            };
        }
        extractQueryString(url) {
            let indexOfQuestionMark = url.indexOf("?");
            if (indexOfQuestionMark < 0) {
                return;
            }
            let params = url.substr(indexOfQuestionMark + 1);
            let helper = new URLSearchParams(params);
            let returnObject = {};
            helper.forEach((value, key) => {
                returnObject[key] = value;
            });
            console.log(returnObject);
            return returnObject;
        }
        stripQueryString(url) {
            let indexOfQuestionMark = url.indexOf("?");
            if (indexOfQuestionMark < 0) {
                return url;
            }
            return url.substr(0, indexOfQuestionMark);
        }
        setStrategy(strategy) {
            if (this._started === true) {
                this.strategy.offURLChange(this.routeChangedHandler);
            }
            this.strategy = strategy;
            if (this._started) {
                this.strategy.onURLChange(this.routeChangedHandler);
            }
        }
        addRoute(...route) {
            this.routes.push(...route);
        }
        removeRoute(...route) {
            this.routes = this.routes.filter((r) => !route.includes(r));
        }
        start() {
            this._started = true;
            this.strategy.onURLChange(this.routeChangedHandler);
            this.strategy.callChangeListeners(this.strategy.currentURL());
        }
        routeNotFound(url) {
        }
        routeGuarded(route) {
        }
        currentURL() {
            return this.strategy.currentURL();
        }
        navigateTo(url, callListeners = true) {
            return this.strategy.changeURL(url, callListeners);
        }
    }
    const AppRouter = new Router();

    class HistoryApiStrategy {
        constructor() {
            this._paused = false;
            this._triggerChange = true;
            this._changeListeners = [];
            this._currentURL = window.location.pathname.substr(1);
            window.addEventListener("popstate", (ev) => {
                this.urlChangedHandler();
                ev.preventDefault();
            });
        }
        urlChangedHandler() {
            if (this._paused)
                return;
            let newURL = window.location.pathname.substr(1);
            this._currentURL = newURL;
            if (this._triggerChange) {
                this.callChangeListeners(newURL);
            }
            else {
                console.debug("URL changed but 'triggerChange' prevented router from calling change listeners!");
            }
        }
        callChangeListeners(url) {
            this._changeListeners.forEach((listener) => listener(url !== null && url !== void 0 ? url : this.currentURL()));
        }
        offURLChange(fn) {
            this._changeListeners = this._changeListeners.filter((f) => f !== fn);
        }
        onURLChange(fn, once) {
            if (once === true) {
                let onceListener = (newURL) => {
                    fn(newURL);
                    this.offURLChange(onceListener);
                };
                this._changeListeners.push((onceListener));
            }
            else {
                this._changeListeners.push(fn);
            }
        }
        currentURL() {
            return this._currentURL;
        }
        changeURL(url, triggerURLChange) {
            this._triggerChange = triggerURLChange !== null && triggerURLChange !== void 0 ? triggerURLChange : true;
            window.history.pushState({}, '', url);
            this.urlChangedHandler();
            this._triggerChange = true;
        }
        pause() {
            this._paused = true;
        }
        resume() {
            this._paused = false;
        }
        setPausedState(paused) {
            this._paused = paused;
        }
    }

    const DisplayRoutedComponent = (comp, props = {}) => {
        return async ({ url, queryParams, urlParams }) => {
            CurrentRoute$1.set({
                url,
                queryParams,
                urlParams,
                visibleComponent: comp,
                componentProperties: props,
                state: 'ok',
            });
        };
    };

    const Breadcrumb$1 = {
        background_color: 'var(--transparent-background-60)',
        fade_ratio: 0.1,
        separator_color: 'var(--main-color)',
        separator_size: '0.7em',
        separator_weight: 800,
        width: 'auto'
    };
    const Button$1 = {
        background_color: 'var(--main-color)',
        text_color: 'var(--text-on-main-color)',
        border: '1px solid transparent',
        padding: '6px 10px',
        width: 'auto',
        text_weight: 500
    };
    const Card$1 = {
        width: '30vw',
        background_color: 'var(--transparent-background-50)',
        image_vertical_alignment: 'center',
        title_font_size: '1.2em',
        title_font_weight: '500',
        description_font_size: '0.8em',
        description_font_weight: '300',
        actions_background_color: 'rgba(0, 0, 0, 0.05);',
    };
    const Chip$1 = {
        background_color: 'var(--main-color-25)',
        color: 'var(--main-color)',
        padding: '2px 15px',
        width: 'auto',
        text_weight: 500,
    };
    const CircularFrame$1 = {
        border: '3px solid var(--main-color-50)',
        ratio: 1,
        status_color: 'var(--sucess-color, green)',
        status_text_color: 'var(--text-on-sucess-color, white)',
    };
    // SVG icon default styling
    const SVGIcon$1 = {
        aspect_ratio: 1,
        size: '1.5em',
        bg_color: 'transparent',
        box_radius: '50%',
        color: 'var(--main-color)',
        margin: '0'
    };
    const DefaultStyles = {
        form: {
            CheckBox: {},
            ColorPicker: {},
            DatePicker: {},
            PasswordInput: {},
            Radio: {},
            RichText: {},
            Select: {},
            Switch: {},
            TextArea: {},
            TextInput: {},
        },
        interface: {
            AlertBox: {},
            Breadcrumb: Breadcrumb$1,
            Button: Button$1,
            Card: Card$1,
            Chip: Chip$1,
            CircularFrame: CircularFrame$1,
            ContextMenu: {},
            Dropdown: {},
            ExpandableContainer: {},
            FloatingActionButton: {},
            IconButton: {},
            Popup: {},
            ProgressBar: {},
            ProgressRing: {},
            ResizableContainer: {},
            SVGIcon: SVGIcon$1,
            Tab: {},
            Tooltip: {},
        },
        modals: {
            AcknowledgeDialog: {},
            ConfirmDialog: {},
            DrawerWindow: {},
            Modal: {},
            Window: {},
        }
    };

    /* src\components\interface\svg_icon\SVGIcon.svelte generated by Svelte v3.37.0 */
    const file$h = "src\\components\\interface\\svg_icon\\SVGIcon.svelte";

    function create_fragment$k(ctx) {
    	let div1;
    	let div0;
    	let div1_class_value;
    	let div1_style_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "fix-ratio");
    			add_location(div0, file$h, 62, 2, 1748);
    			attr_dev(div1, "class", div1_class_value = "ui-icon " + (/*$$props*/ ctx[3].class ?? ""));
    			attr_dev(div1, "style", div1_style_value = "\r\n  --source: url(" + /*src*/ ctx[0] + "); \r\n  --size : " + (/*styles*/ ctx[1].size ?? /*defaultStyles*/ ctx[2].size) + "; \r\n  --icon-color: " + (/*styles*/ ctx[1].color ?? /*defaultStyles*/ ctx[2].color) + "; \r\n  --radius: " + (/*styles*/ ctx[1].box_radius ?? /*defaultStyles*/ ctx[2].box_radius) + "; \r\n  --bg-color : " + (/*styles*/ ctx[1].bg_color ?? /*defaultStyles*/ ctx[2].bg_color) + "; \r\n  --aspect-ratio: " + (/*styles*/ ctx[1].aspect_ratio ?? /*defaultStyles*/ ctx[2].aspect_ratio) + ";\r\n  --margin: " + (/*styles*/ ctx[1].margin ?? /*defaultStyles*/ ctx[2].margin) + "\r\n  ");
    			add_location(div1, file$h, 50, 0, 1297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 8 && div1_class_value !== (div1_class_value = "ui-icon " + (/*$$props*/ ctx[3].class ?? ""))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*src, styles*/ 3 && div1_style_value !== (div1_style_value = "\r\n  --source: url(" + /*src*/ ctx[0] + "); \r\n  --size : " + (/*styles*/ ctx[1].size ?? /*defaultStyles*/ ctx[2].size) + "; \r\n  --icon-color: " + (/*styles*/ ctx[1].color ?? /*defaultStyles*/ ctx[2].color) + "; \r\n  --radius: " + (/*styles*/ ctx[1].box_radius ?? /*defaultStyles*/ ctx[2].box_radius) + "; \r\n  --bg-color : " + (/*styles*/ ctx[1].bg_color ?? /*defaultStyles*/ ctx[2].bg_color) + "; \r\n  --aspect-ratio: " + (/*styles*/ ctx[1].aspect_ratio ?? /*defaultStyles*/ ctx[2].aspect_ratio) + ";\r\n  --margin: " + (/*styles*/ ctx[1].margin ?? /*defaultStyles*/ ctx[2].margin) + "\r\n  ")) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SVGIcon", slots, []);
    	
    	let { src } = $$props;
    	let { styles = {} } = $$props;
    	const defaultStyles = DefaultStyles.interface.SVGIcon;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("src" in $$new_props) $$invalidate(0, src = $$new_props.src);
    		if ("styles" in $$new_props) $$invalidate(1, styles = $$new_props.styles);
    	};

    	$$self.$capture_state = () => ({
    		DefaultStyles,
    		src,
    		styles,
    		defaultStyles
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("src" in $$props) $$invalidate(0, src = $$new_props.src);
    		if ("styles" in $$props) $$invalidate(1, styles = $$new_props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [src, styles, defaultStyles, $$props];
    }

    class SVGIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { src: 0, styles: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SVGIcon",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<SVGIcon> was created without expected prop 'src'");
    		}
    	}

    	get src() {
    		throw new Error("<SVGIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<SVGIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<SVGIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<SVGIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\button\Button.svelte generated by Svelte v3.37.0 */
    const file$g = "src\\components\\interface\\button\\Button.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "ui-button clickable " + (/*$$props*/ ctx[2].class ?? "") + " svelte-1ll80sr");

    			attr_dev(div, "style", div_style_value = "\r\n  " + (/*styles*/ ctx[0].box_shadow != null
    			? "--box-shadow: " + /*styles*/ ctx[0].box_shadow + ";"
    			: "") + "\r\n  " + (/*styles*/ ctx[0].text_underline != null
    			? "--text-underline: " + /*styles*/ ctx[0].text_underline + ";"
    			: "") + "\r\n  --background-color : " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n  --text-color : " + (/*styles*/ ctx[0].text_color ?? /*defaultStyles*/ ctx[1].text_color) + ";\r\n  --border: " + (/*styles*/ ctx[0].border ?? /*defaultStyles*/ ctx[1].border) + ";\r\n  --padding: " + (/*styles*/ ctx[0].padding ?? /*defaultStyles*/ ctx[1].padding) + ";\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n  --font-weight: " + (/*styles*/ ctx[0].text_weight ?? /*defaultStyles*/ ctx[1].text_weight) + "\r\n");

    			add_location(div, file$g, 36, 0, 1037);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div, "contextmenu", /*contextmenu_handler*/ ctx[6], false, false, false),
    					listen_dev(div, "dblclick", /*dblclick_handler*/ ctx[7], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(div, "focus", /*focus_handler*/ ctx[10], false, false, false),
    					listen_dev(div, "blur", /*blur_handler*/ ctx[11], false, false, false),
    					listen_dev(div, "mousedown", /*mousedown_handler*/ ctx[12], false, false, false),
    					listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 4 && div_class_value !== (div_class_value = "ui-button clickable " + (/*$$props*/ ctx[2].class ?? "") + " svelte-1ll80sr")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*styles*/ 1 && div_style_value !== (div_style_value = "\r\n  " + (/*styles*/ ctx[0].box_shadow != null
    			? "--box-shadow: " + /*styles*/ ctx[0].box_shadow + ";"
    			: "") + "\r\n  " + (/*styles*/ ctx[0].text_underline != null
    			? "--text-underline: " + /*styles*/ ctx[0].text_underline + ";"
    			: "") + "\r\n  --background-color : " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n  --text-color : " + (/*styles*/ ctx[0].text_color ?? /*defaultStyles*/ ctx[1].text_color) + ";\r\n  --border: " + (/*styles*/ ctx[0].border ?? /*defaultStyles*/ ctx[1].border) + ";\r\n  --padding: " + (/*styles*/ ctx[0].padding ?? /*defaultStyles*/ ctx[1].padding) + ";\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n  --font-weight: " + (/*styles*/ ctx[0].text_weight ?? /*defaultStyles*/ ctx[1].text_weight) + "\r\n")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	
    	let { styles = {} } = $$props;
    	const defaultStyles = DefaultStyles.interface.Button;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("styles" in $$new_props) $$invalidate(0, styles = $$new_props.styles);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ DefaultStyles, styles, defaultStyles });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("styles" in $$props) $$invalidate(0, styles = $$new_props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		styles,
    		defaultStyles,
    		$$props,
    		$$scope,
    		slots,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		mousedown_handler,
    		mouseup_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get styles() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\button\IconTextButton.svelte generated by Svelte v3.37.0 */
    const file$f = "src\\components\\interface\\button\\IconTextButton.svelte";

    // (31:0) <Button    styles={{       ...styles,       padding: icon_position == 'left' ? "6px 20px 6px 60px" : '6px 60px 6px 20px'       }}    on:click    on:dblclick    on:contextmenu    on:mousedown    on:mouseup    on:mouseenter    on:mouseleave  >
    function create_default_slot$6(ctx) {
    	let div;
    	let svgicon;
    	let div_class_value;
    	let t0;
    	let t1;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: /*icon_src*/ ctx[0],
    				styles: {
    					size: "30px",
    					color: /*styles*/ ctx[3].background_color ?? DefaultStyles.interface.Button.background_color
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgicon.$$.fragment);
    			t0 = space();
    			t1 = text(/*text*/ ctx[1]);
    			attr_dev(div, "class", div_class_value = "ui-button-icon " + /*icon_position*/ ctx[2] + " svelte-xoarne");
    			add_location(div, file$f, 43, 2, 899);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgicon, div, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgicon_changes = {};
    			if (dirty & /*icon_src*/ 1) svgicon_changes.src = /*icon_src*/ ctx[0];

    			if (dirty & /*styles*/ 8) svgicon_changes.styles = {
    				size: "30px",
    				color: /*styles*/ ctx[3].background_color ?? DefaultStyles.interface.Button.background_color
    			};

    			svgicon.$set(svgicon_changes);

    			if (!current || dirty & /*icon_position*/ 4 && div_class_value !== (div_class_value = "ui-button-icon " + /*icon_position*/ ctx[2] + " svelte-xoarne")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgicon);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(31:0) <Button    styles={{       ...styles,       padding: icon_position == 'left' ? \\\"6px 20px 6px 60px\\\" : '6px 60px 6px 20px'       }}    on:click    on:dblclick    on:contextmenu    on:mousedown    on:mouseup    on:mouseenter    on:mouseleave  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				styles: {
    					.../*styles*/ ctx[3],
    					padding: /*icon_position*/ ctx[2] == "left"
    					? "6px 20px 6px 60px"
    					: "6px 60px 6px 20px"
    				},
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[4]);
    	button.$on("dblclick", /*dblclick_handler*/ ctx[5]);
    	button.$on("contextmenu", /*contextmenu_handler*/ ctx[6]);
    	button.$on("mousedown", /*mousedown_handler*/ ctx[7]);
    	button.$on("mouseup", /*mouseup_handler*/ ctx[8]);
    	button.$on("mouseenter", /*mouseenter_handler*/ ctx[9]);
    	button.$on("mouseleave", /*mouseleave_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*styles, icon_position*/ 12) button_changes.styles = {
    				.../*styles*/ ctx[3],
    				padding: /*icon_position*/ ctx[2] == "left"
    				? "6px 20px 6px 60px"
    				: "6px 60px 6px 20px"
    			};

    			if (dirty & /*$$scope, text, icon_position, icon_src, styles*/ 2063) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconTextButton", slots, []);
    	
    	let { icon_src } = $$props;
    	let { text } = $$props;
    	let { icon_position = "left" } = $$props;
    	let { styles = {} } = $$props;
    	const writable_props = ["icon_src", "text", "icon_position", "styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconTextButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("icon_src" in $$props) $$invalidate(0, icon_src = $$props.icon_src);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("icon_position" in $$props) $$invalidate(2, icon_position = $$props.icon_position);
    		if ("styles" in $$props) $$invalidate(3, styles = $$props.styles);
    	};

    	$$self.$capture_state = () => ({
    		App,
    		DefaultStyles,
    		SvgIcon: SVGIcon,
    		Button,
    		icon_src,
    		text,
    		icon_position,
    		styles
    	});

    	$$self.$inject_state = $$props => {
    		if ("icon_src" in $$props) $$invalidate(0, icon_src = $$props.icon_src);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("icon_position" in $$props) $$invalidate(2, icon_position = $$props.icon_position);
    		if ("styles" in $$props) $$invalidate(3, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		icon_src,
    		text,
    		icon_position,
    		styles,
    		click_handler,
    		dblclick_handler,
    		contextmenu_handler,
    		mousedown_handler,
    		mouseup_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class IconTextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			icon_src: 0,
    			text: 1,
    			icon_position: 2,
    			styles: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconTextButton",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon_src*/ ctx[0] === undefined && !("icon_src" in props)) {
    			console.warn("<IconTextButton> was created without expected prop 'icon_src'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<IconTextButton> was created without expected prop 'text'");
    		}
    	}

    	get icon_src() {
    		throw new Error("<IconTextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_src(value) {
    		throw new Error("<IconTextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<IconTextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<IconTextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon_position() {
    		throw new Error("<IconTextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_position(value) {
    		throw new Error("<IconTextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<IconTextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<IconTextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\link\Link.svelte generated by Svelte v3.37.0 */
    const file$e = "src\\components\\interface\\link\\Link.svelte";

    function create_fragment$h(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "class", "ui-link");
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			add_location(a, file$e, 7, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(/*click_handler*/ ctx[3]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { href } = $$props;
    	const writable_props = ["href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		AppRouter.navigateTo(href);
    	};

    	$$self.$$set = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ AppRouter, href });

    	$$self.$inject_state = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, $$scope, slots, click_handler];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { href: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*href*/ ctx[0] === undefined && !("href" in props)) {
    			console.warn("<Link> was created without expected prop 'href'");
    		}
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const DarkTheme = {
        name: 'dark',
        title: 'Dark Theme',
        variables: {
            "secondary-color": "#E82C47",
            "secondary-color-75": "#DA2F49",
            "secondary-color-50": "#E36376",
            "secondary-color-25": "#f7c7ce",
            "text-on-secondary-color": "#f8f8f8",
            "main-color": "#006597",
            "main-color-75": "#006DA3",
            "main-color-50": "#126B97",
            "main-color-25": "#CEDFE8",
            "text-on-main-color": "#f8f8f8",
            // Background color
            "background-color": '#282828',
            "transparent-background-90": 'rgba(0,0,0,0.35)',
            "transparent-background-80": 'rgba(0,0,0,0.3)',
            "transparent-background-70": 'rgba(0,0,0,0.25)',
            "transparent-background-60": 'rgba(0,0,0,0.2)',
            "transparent-background-50": 'rgba(0,0,0,0.15)',
            "transparent-background-40": 'rgba(0,0,0,0.1)',
            "transparent-background-30": 'rgba(0,0,0,0.05)',
            "text-on-background-color": "#e6e6e6",
            "border-radius": "4px",
            // Box shadow
            "default-box-shadow": '0px 4px 6px -4px rgba(0,0,0,0.6)',
            "box-shadow-1": '0px 4px 6px -4px rgba(0,0,0,0.8)',
            "box-shadow-2": '0px 7px 6px -5px rgba(0,0,0,0.6)',
            "box-shadow-3": '1px 1px 8px 0px rgba(0,0,0,0.2)',
            "box-shadow-4": '',
        }
    };

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src\pages\LandingPage.svelte generated by Svelte v3.37.0 */
    const file$d = "src\\pages\\LandingPage.svelte";

    // (27:4) <Link href="about">
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("UI Kit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(27:4) <Link href=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (27:39) <Link href="workspace">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Workspace");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(27:39) <Link href=\\\"workspace\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:4) <Link href="know-more">
    function create_default_slot$5(ctx) {
    	let icontextbutton;
    	let current;

    	icontextbutton = new IconTextButton({
    			props: {
    				icon_src: "/img/harmony.logo.svg",
    				text: "Know more",
    				icon_position: "right"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icontextbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icontextbutton, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icontextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icontextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icontextbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(31:4) <Link href=\\\"know-more\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div2;
    	let svgicon;
    	let t0;
    	let div0;
    	let t2;
    	let nav;
    	let link0;
    	let t3;
    	let link1;
    	let t4;
    	let br;
    	let t5;
    	let div1;
    	let link2;
    	let t6;
    	let icontextbutton;
    	let div2_transition;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: "/img/harmony.logo.svg",
    				styles: { size: "30vh" }
    			},
    			$$inline: true
    		});

    	link0 = new Link({
    			props: {
    				href: "about",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				href: "workspace",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				href: "know-more",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	icontextbutton = new IconTextButton({
    			props: {
    				icon_src: "/img/icons/theme.svg",
    				text: "Change theme",
    				icon_position: "left"
    			},
    			$$inline: true
    		});

    	icontextbutton.$on("click", /*click_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(svgicon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Welcome to Harmony App!";
    			t2 = space();
    			nav = element("nav");
    			create_component(link0.$$.fragment);
    			t3 = text(" | ");
    			create_component(link1.$$.fragment);
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			div1 = element("div");
    			create_component(link2.$$.fragment);
    			t6 = space();
    			create_component(icontextbutton.$$.fragment);
    			attr_dev(div0, "class", "message svelte-1annx4o");
    			add_location(div0, file$d, 24, 2, 762);
    			add_location(nav, file$d, 25, 2, 816);
    			add_location(br, file$d, 28, 2, 915);
    			add_location(div1, file$d, 29, 2, 925);
    			attr_dev(div2, "class", "page svelte-1annx4o");
    			add_location(div2, file$d, 22, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(svgicon, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, nav);
    			mount_component(link0, nav, null);
    			append_dev(nav, t3);
    			mount_component(link1, nav, null);
    			append_dev(div2, t4);
    			append_dev(div2, br);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			mount_component(link2, div1, null);
    			append_dev(div1, t6);
    			mount_component(icontextbutton, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(icontextbutton.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(icontextbutton.$$.fragment, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(svgicon);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(icontextbutton);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $CurrentTheme;
    	validate_store(CurrentTheme, "CurrentTheme");
    	component_subscribe($$self, CurrentTheme, $$value => $$invalidate(0, $CurrentTheme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LandingPage", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LandingPage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if ($CurrentTheme.name === "light") {
    			set_store_value(CurrentTheme, $CurrentTheme = DarkTheme, $CurrentTheme);
    		} else {
    			set_store_value(CurrentTheme, $CurrentTheme = LightInterfaceTheme, $CurrentTheme);
    		}
    	};

    	$$self.$capture_state = () => ({
    		IconTextButton,
    		Link,
    		SvgIcon: SVGIcon,
    		CurrentTheme,
    		DarkTheme,
    		LightInterfaceTheme,
    		fade,
    		$CurrentTheme
    	});

    	return [$CurrentTheme, click_handler];
    }

    class LandingPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LandingPage",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\interface\breadcrumb\Breadcrumb.svelte generated by Svelte v3.37.0 */
    const file$c = "src\\components\\interface\\breadcrumb\\Breadcrumb.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "ui-breadcrumb svelte-17iy540");
    			attr_dev(div, "style", div_style_value = "\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[2].width) + ";\r\n  --background-color : " + (/*styles*/ ctx[0]?.background_color ?? /*defaultStyles*/ ctx[2].background_color) + ";\r\n  --separator-color : " + (/*styles*/ ctx[0]?.separator_color ?? /*defaultStyles*/ ctx[2].separator_color) + ";\r\n  --separator-size : " + (/*styles*/ ctx[0]?.separator_size ?? /*defaultStyles*/ ctx[2].separator_size) + ";\r\n  --separator-weight : " + (/*styles*/ ctx[0]?.separator_weight ?? /*defaultStyles*/ ctx[2].separator_weight) + ";\r\n");
    			add_location(div, file$c, 52, 0, 1689);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[6](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*styles*/ 1 && div_style_value !== (div_style_value = "\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[2].width) + ";\r\n  --background-color : " + (/*styles*/ ctx[0]?.background_color ?? /*defaultStyles*/ ctx[2].background_color) + ";\r\n  --separator-color : " + (/*styles*/ ctx[0]?.separator_color ?? /*defaultStyles*/ ctx[2].separator_color) + ";\r\n  --separator-size : " + (/*styles*/ ctx[0]?.separator_size ?? /*defaultStyles*/ ctx[2].separator_size) + ";\r\n  --separator-weight : " + (/*styles*/ ctx[0]?.separator_weight ?? /*defaultStyles*/ ctx[2].separator_weight) + ";\r\n")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Breadcrumb", slots, ['default']);
    	
    	let { separator } = $$props;
    	let { styles = {} } = $$props;
    	let defaultStyles = DefaultStyles.interface.Breadcrumb;
    	let container;

    	afterUpdate(() => {
    		let items = container.querySelectorAll(":scope>.ui-breadcrumb-item:not(:last-child)");

    		items.forEach((item, ind) => {
    			var _a, _b;
    			let newSeparator = document.createElement("div");
    			newSeparator.classList.add("ui-breadcrumb-separator");
    			newSeparator.innerText = separator;
    			item.after(newSeparator);

    			if (((_a = styles.fade_ratio) !== null && _a !== void 0
    			? _a
    			: defaultStyles.fade_ratio) > 0) {
    				let newOpacity = String(1 - (items.length - ind) * ((_b = styles.fade_ratio) !== null && _b !== void 0
    				? _b
    				: defaultStyles.fade_ratio));

    				item.style.opacity = newOpacity;
    				newSeparator.style.opacity = newOpacity;
    			}
    		});
    	});

    	const writable_props = ["separator", "styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Breadcrumb> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("separator" in $$props) $$invalidate(3, separator = $$props.separator);
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		DefaultStyles,
    		separator,
    		styles,
    		defaultStyles,
    		container
    	});

    	$$self.$inject_state = $$props => {
    		if ("separator" in $$props) $$invalidate(3, separator = $$props.separator);
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("defaultStyles" in $$props) $$invalidate(2, defaultStyles = $$props.defaultStyles);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [styles, container, defaultStyles, separator, $$scope, slots, div_binding];
    }

    class Breadcrumb extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { separator: 3, styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Breadcrumb",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*separator*/ ctx[3] === undefined && !("separator" in props)) {
    			console.warn("<Breadcrumb> was created without expected prop 'separator'");
    		}
    	}

    	get separator() {
    		throw new Error("<Breadcrumb>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set separator(value) {
    		throw new Error("<Breadcrumb>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<Breadcrumb>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Breadcrumb>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\breadcrumb\BreadcrumbItem.svelte generated by Svelte v3.37.0 */

    const file$b = "src\\components\\interface\\breadcrumb\\BreadcrumbItem.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "ui-breadcrumb-item " + (/*$$props*/ ctx[0].class ?? "") + " svelte-1ahuuur");
    			add_location(div, file$b, 7, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(div, "contextmenu", /*contextmenu_handler*/ ctx[4], false, false, false),
    					listen_dev(div, "dblclick", /*dblclick_handler*/ ctx[5], false, false, false),
    					listen_dev(div, "mouseover", /*mouseover_handler*/ ctx[6], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 1 && div_class_value !== (div_class_value = "ui-breadcrumb-item " + (/*$$props*/ ctx[0].class ?? "") + " svelte-1ahuuur")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BreadcrumbItem", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		$$props,
    		$$scope,
    		slots,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseover_handler,
    		mouseleave_handler
    	];
    }

    class BreadcrumbItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BreadcrumbItem",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\components\interface\button\DimmedButton.svelte generated by Svelte v3.37.0 */

    // (6:0) <Button    styles={{      background_color: 'var(--main-color-25)',      text_color: 'var(--main-color)',      ...styles,    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >
    function create_default_slot$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(6:0) <Button    styles={{      background_color: 'var(--main-color-25)',      text_color: 'var(--main-color)',      ...styles,    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				styles: {
    					background_color: "var(--main-color-25)",
    					text_color: "var(--main-color)",
    					.../*styles*/ ctx[0]
    				},
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[2]);
    	button.$on("contextmenu", /*contextmenu_handler*/ ctx[3]);
    	button.$on("dblclick", /*dblclick_handler*/ ctx[4]);
    	button.$on("mouseover", /*mouseover_handler*/ ctx[5]);
    	button.$on("mouseleave", /*mouseleave_handler*/ ctx[6]);
    	button.$on("focus", /*focus_handler*/ ctx[7]);
    	button.$on("blur", /*blur_handler*/ ctx[8]);
    	button.$on("mousedown", /*mousedown_handler*/ ctx[9]);
    	button.$on("mouseup", /*mouseup_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*styles*/ 1) button_changes.styles = {
    				background_color: "var(--main-color-25)",
    				text_color: "var(--main-color)",
    				.../*styles*/ ctx[0]
    			};

    			if (dirty & /*$$scope*/ 2048) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DimmedButton", slots, ['default']);
    	
    	let { styles = {} } = $$props;
    	const writable_props = ["styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DimmedButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Button, styles });

    	$$self.$inject_state = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		styles,
    		slots,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseover_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		mousedown_handler,
    		mouseup_handler,
    		$$scope
    	];
    }

    class DimmedButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DimmedButton",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get styles() {
    		throw new Error("<DimmedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<DimmedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\button\OutlineButton.svelte generated by Svelte v3.37.0 */

    // (6:0) <Button    styles={{      background_color: "transparent",      text_color: "var(--main-color)",      border: "1px solid var(--main-color-50)",      box_shadow: "0",      ...styles,    }}    on:mousedown={() => {      styles.background_color = "var(--main-color-25)";    }}    on:mouseup={() => {      styles.background_color = "transparent";    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >
    function create_default_slot$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(6:0) <Button    styles={{      background_color: \\\"transparent\\\",      text_color: \\\"var(--main-color)\\\",      border: \\\"1px solid var(--main-color-50)\\\",      box_shadow: \\\"0\\\",      ...styles,    }}    on:mousedown={() => {      styles.background_color = \\\"var(--main-color-25)\\\";    }}    on:mouseup={() => {      styles.background_color = \\\"transparent\\\";    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				styles: {
    					background_color: "transparent",
    					text_color: "var(--main-color)",
    					border: "1px solid var(--main-color-50)",
    					box_shadow: "0",
    					.../*styles*/ ctx[0]
    				},
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("mousedown", /*mousedown_handler_1*/ ctx[2]);
    	button.$on("mouseup", /*mouseup_handler_1*/ ctx[3]);
    	button.$on("click", /*click_handler*/ ctx[4]);
    	button.$on("contextmenu", /*contextmenu_handler*/ ctx[5]);
    	button.$on("dblclick", /*dblclick_handler*/ ctx[6]);
    	button.$on("mouseover", /*mouseover_handler*/ ctx[7]);
    	button.$on("mouseleave", /*mouseleave_handler*/ ctx[8]);
    	button.$on("focus", /*focus_handler*/ ctx[9]);
    	button.$on("blur", /*blur_handler*/ ctx[10]);
    	button.$on("mousedown", /*mousedown_handler*/ ctx[11]);
    	button.$on("mouseup", /*mouseup_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*styles*/ 1) button_changes.styles = {
    				background_color: "transparent",
    				text_color: "var(--main-color)",
    				border: "1px solid var(--main-color-50)",
    				box_shadow: "0",
    				.../*styles*/ ctx[0]
    			};

    			if (dirty & /*$$scope*/ 8192) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("OutlineButton", slots, ['default']);
    	
    	let { styles = {} } = $$props;
    	const writable_props = ["styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OutlineButton> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler_1 = () => {
    		$$invalidate(0, styles.background_color = "var(--main-color-25)", styles);
    	};

    	const mouseup_handler_1 = () => {
    		$$invalidate(0, styles.background_color = "transparent", styles);
    	};

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Button, styles });

    	$$self.$inject_state = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		styles,
    		slots,
    		mousedown_handler_1,
    		mouseup_handler_1,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseover_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		mousedown_handler,
    		mouseup_handler,
    		$$scope
    	];
    }

    class OutlineButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OutlineButton",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get styles() {
    		throw new Error("<OutlineButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<OutlineButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\button\TextButton.svelte generated by Svelte v3.37.0 */

    // (6:0) <Button    styles={{      background_color: "transparent",      text_color: "var(--main-color)",      border: "1px solid transparent",      box_shadow: "0",      ...styles,    }}    on:mouseenter={() => {      styles.text_underline =        "underline var(--main-color-50) 2px ";    }}    on:mouseleave={() => {      styles.text_underline = "underline  transparent 2px";    }}    on:mousedown={() => {      styles.background_color = "var(--main-color-25)";    }}    on:mouseup={() => {      styles.background_color = "transparent";    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(6:0) <Button    styles={{      background_color: \\\"transparent\\\",      text_color: \\\"var(--main-color)\\\",      border: \\\"1px solid transparent\\\",      box_shadow: \\\"0\\\",      ...styles,    }}    on:mouseenter={() => {      styles.text_underline =        \\\"underline var(--main-color-50) 2px \\\";    }}    on:mouseleave={() => {      styles.text_underline = \\\"underline  transparent 2px\\\";    }}    on:mousedown={() => {      styles.background_color = \\\"var(--main-color-25)\\\";    }}    on:mouseup={() => {      styles.background_color = \\\"transparent\\\";    }}    on:click    on:contextmenu    on:dblclick    on:mouseover    on:mouseleave    on:focus    on:blur    on:mousedown    on:mouseup  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				styles: {
    					background_color: "transparent",
    					text_color: "var(--main-color)",
    					border: "1px solid transparent",
    					box_shadow: "0",
    					.../*styles*/ ctx[0]
    				},
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("mouseenter", /*mouseenter_handler*/ ctx[2]);
    	button.$on("mouseleave", /*mouseleave_handler_1*/ ctx[3]);
    	button.$on("mousedown", /*mousedown_handler_1*/ ctx[4]);
    	button.$on("mouseup", /*mouseup_handler_1*/ ctx[5]);
    	button.$on("click", /*click_handler*/ ctx[6]);
    	button.$on("contextmenu", /*contextmenu_handler*/ ctx[7]);
    	button.$on("dblclick", /*dblclick_handler*/ ctx[8]);
    	button.$on("mouseover", /*mouseover_handler*/ ctx[9]);
    	button.$on("mouseleave", /*mouseleave_handler*/ ctx[10]);
    	button.$on("focus", /*focus_handler*/ ctx[11]);
    	button.$on("blur", /*blur_handler*/ ctx[12]);
    	button.$on("mousedown", /*mousedown_handler*/ ctx[13]);
    	button.$on("mouseup", /*mouseup_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*styles*/ 1) button_changes.styles = {
    				background_color: "transparent",
    				text_color: "var(--main-color)",
    				border: "1px solid transparent",
    				box_shadow: "0",
    				.../*styles*/ ctx[0]
    			};

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextButton", slots, ['default']);
    	
    	let { styles = {} } = $$props;
    	const writable_props = ["styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextButton> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => {
    		$$invalidate(0, styles.text_underline = "underline var(--main-color-50) 2px ", styles);
    	};

    	const mouseleave_handler_1 = () => {
    		$$invalidate(0, styles.text_underline = "underline  transparent 2px", styles);
    	};

    	const mousedown_handler_1 = () => {
    		$$invalidate(0, styles.background_color = "var(--main-color-25)", styles);
    	};

    	const mouseup_handler_1 = () => {
    		$$invalidate(0, styles.background_color = "transparent", styles);
    	};

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Button, styles });

    	$$self.$inject_state = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		styles,
    		slots,
    		mouseenter_handler,
    		mouseleave_handler_1,
    		mousedown_handler_1,
    		mouseup_handler_1,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseover_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		mousedown_handler,
    		mouseup_handler,
    		$$scope
    	];
    }

    class TextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextButton",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get styles() {
    		throw new Error("<TextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<TextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\card\Card.svelte generated by Svelte v3.37.0 */
    const file$a = "src\\components\\interface\\card\\Card.svelte";
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_description_slot_changes = dirty => ({});
    const get_description_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_image_slot_changes = dirty => ({});
    const get_image_slot_context = ctx => ({});

    function create_fragment$a(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let t3;
    	let div3;
    	let div4_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const image_slot_template = /*#slots*/ ctx[3].image;
    	const image_slot = create_slot(image_slot_template, ctx, /*$$scope*/ ctx[2], get_image_slot_context);
    	const title_slot_template = /*#slots*/ ctx[3].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[2], get_title_slot_context);
    	const description_slot_template = /*#slots*/ ctx[3].description;
    	const description_slot = create_slot(description_slot_template, ctx, /*$$scope*/ ctx[2], get_description_slot_context);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);
    	const actions_slot_template = /*#slots*/ ctx[3].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[2], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (image_slot) image_slot.c();
    			t0 = space();
    			div1 = element("div");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			div2 = element("div");
    			if (description_slot) description_slot.c();
    			t2 = space();
    			if (default_slot) default_slot.c();
    			t3 = space();
    			div3 = element("div");
    			if (actions_slot) actions_slot.c();
    			attr_dev(div0, "class", "ui-card-image svelte-1tzv6ds");
    			add_location(div0, file$a, 82, 2, 2305);
    			attr_dev(div1, "class", "ui-card-title svelte-1tzv6ds");
    			add_location(div1, file$a, 85, 2, 2373);
    			attr_dev(div2, "class", "ui-card-description svelte-1tzv6ds");
    			add_location(div2, file$a, 88, 2, 2441);
    			attr_dev(div3, "class", "ui-card-actions svelte-1tzv6ds");
    			add_location(div3, file$a, 92, 2, 2535);
    			attr_dev(div4, "class", "ui-card svelte-1tzv6ds");

    			attr_dev(div4, "style", div4_style_value = "\r\n--width : " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n--background-color: " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n" + (/*styles*/ ctx[0].image_max_height != null
    			? "--image-max-height: " + /*styles*/ ctx[0].image_max_height + ";"
    			: "") + "\r\n    --title-font-size: " + (/*styles*/ ctx[0].title_font_size ?? /*defaultStyles*/ ctx[1].title_font_size) + ";\r\n    --title-font-weight: " + (/*styles*/ ctx[0].title_font_weight ?? /*defaultStyles*/ ctx[1].title_font_weight) + ";\r\n    --description-font-size : " + (/*styles*/ ctx[0].description_font_size ?? /*defaultStyles*/ ctx[1].description_font_size) + ";\r\n    --description-font-weight: " + (/*styles*/ ctx[0].description_font_weight ?? /*defaultStyles*/ ctx[1].description_font_weight) + ";\r\n    --actions-background-color: " + (/*styles*/ ctx[0].actions_background_color ?? /*defaultStyles*/ ctx[1].actions_background_color) + ";\r\n");

    			add_location(div4, file$a, 59, 0, 1484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);

    			if (image_slot) {
    				image_slot.m(div0, null);
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div1);

    			if (title_slot) {
    				title_slot.m(div1, null);
    			}

    			append_dev(div4, t1);
    			append_dev(div4, div2);

    			if (description_slot) {
    				description_slot.m(div2, null);
    			}

    			append_dev(div2, t2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);

    			if (actions_slot) {
    				actions_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (image_slot) {
    				if (image_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(image_slot, image_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_image_slot_changes, get_image_slot_context);
    				}
    			}

    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (description_slot) {
    				if (description_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(description_slot, description_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_description_slot_changes, get_description_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (actions_slot) {
    				if (actions_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(actions_slot, actions_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_actions_slot_changes, get_actions_slot_context);
    				}
    			}

    			if (!current || dirty & /*styles*/ 1 && div4_style_value !== (div4_style_value = "\r\n--width : " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n--background-color: " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n" + (/*styles*/ ctx[0].image_max_height != null
    			? "--image-max-height: " + /*styles*/ ctx[0].image_max_height + ";"
    			: "") + "\r\n    --title-font-size: " + (/*styles*/ ctx[0].title_font_size ?? /*defaultStyles*/ ctx[1].title_font_size) + ";\r\n    --title-font-weight: " + (/*styles*/ ctx[0].title_font_weight ?? /*defaultStyles*/ ctx[1].title_font_weight) + ";\r\n    --description-font-size : " + (/*styles*/ ctx[0].description_font_size ?? /*defaultStyles*/ ctx[1].description_font_size) + ";\r\n    --description-font-weight: " + (/*styles*/ ctx[0].description_font_weight ?? /*defaultStyles*/ ctx[1].description_font_weight) + ";\r\n    --actions-background-color: " + (/*styles*/ ctx[0].actions_background_color ?? /*defaultStyles*/ ctx[1].actions_background_color) + ";\r\n")) {
    				attr_dev(div4, "style", div4_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_slot, local);
    			transition_in(title_slot, local);
    			transition_in(description_slot, local);
    			transition_in(default_slot, local);
    			transition_in(actions_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_slot, local);
    			transition_out(title_slot, local);
    			transition_out(description_slot, local);
    			transition_out(default_slot, local);
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (image_slot) image_slot.d(detaching);
    			if (title_slot) title_slot.d(detaching);
    			if (description_slot) description_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (actions_slot) actions_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['image','title','description','default','actions']);
    	
    	let { styles = {} } = $$props;
    	const defaultStyles = DefaultStyles.interface.Card;
    	const writable_props = ["styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ DefaultStyles, styles, defaultStyles });

    	$$self.$inject_state = $$props => {
    		if ("styles" in $$props) $$invalidate(0, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [styles, defaultStyles, $$scope, slots, click_handler];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get styles() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\icon_button\IconButton.svelte generated by Svelte v3.37.0 */
    const file$9 = "src\\components\\interface\\icon_button\\IconButton.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let svgicon;
    	let div0_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	svgicon = new SVGIcon({
    			props: {
    				src: /*src*/ ctx[1],
    				styles: { color: "var(--text-on-main-color)" }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(svgicon.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "bg-shape " + /*shape*/ ctx[0] + " svelte-16p4xxb");
    			add_location(div0, file$9, 41, 2, 728);
    			attr_dev(div1, "class", "ui-icon-button clickable svelte-16p4xxb");
    			add_location(div1, file$9, 31, 0, 572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(svgicon, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(div1, "contextmenu", /*contextmenu_handler*/ ctx[3], false, false, false),
    					listen_dev(div1, "mousedown", /*mousedown_handler*/ ctx[4], false, false, false),
    					listen_dev(div1, "mouseleave", /*mouseleave_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "mouseup", /*mouseup_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "mouseleave", /*mouseleave_handler_1*/ ctx[7], false, false, false),
    					listen_dev(div1, "dblclick", /*dblclick_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const svgicon_changes = {};
    			if (dirty & /*src*/ 2) svgicon_changes.src = /*src*/ ctx[1];
    			svgicon.$set(svgicon_changes);

    			if (!current || dirty & /*shape*/ 1 && div0_class_value !== (div0_class_value = "bg-shape " + /*shape*/ ctx[0] + " svelte-16p4xxb")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(svgicon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconButton", slots, []);
    	let { shape = "rounded-square" } = $$props;
    	let { src } = $$props;
    	const writable_props = ["shape", "src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler_1(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("shape" in $$props) $$invalidate(0, shape = $$props.shape);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({ SvgIcon: SVGIcon, shape, src });

    	$$self.$inject_state = $$props => {
    		if ("shape" in $$props) $$invalidate(0, shape = $$props.shape);
    		if ("src" in $$props) $$invalidate(1, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		shape,
    		src,
    		click_handler,
    		contextmenu_handler,
    		mousedown_handler,
    		mouseleave_handler,
    		mouseup_handler,
    		mouseleave_handler_1,
    		dblclick_handler
    	];
    }

    class IconButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { shape: 0, src: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconButton",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[1] === undefined && !("src" in props)) {
    			console.warn("<IconButton> was created without expected prop 'src'");
    		}
    	}

    	get shape() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shape(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\line_separator\LineSeparator.svelte generated by Svelte v3.37.0 */

    const file$8 = "src\\components\\interface\\line_separator\\LineSeparator.svelte";

    function create_fragment$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "line-separator svelte-1vclm9h");
    			add_location(div, file$8, 11, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineSeparator", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LineSeparator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LineSeparator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineSeparator",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\interface\chip\Chip.svelte generated by Svelte v3.37.0 */
    const file$7 = "src\\components\\interface\\chip\\Chip.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "ui-chip clickable " + (/*$$props*/ ctx[2].class ?? "") + " svelte-1tk2e3v");

    			attr_dev(div, "style", div_style_value = "\r\n  " + (/*styles*/ ctx[0].text_underline != null
    			? "--text-underline: " + /*styles*/ ctx[0].text_underline + ";"
    			: "") + "\r\n  --background-color : " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n  --text-color : " + (/*styles*/ ctx[0].color ?? /*defaultStyles*/ ctx[1].color) + ";\r\n  --border: 1px solid " + (/*styles*/ ctx[0].color ?? /*defaultStyles*/ ctx[1].color) + ";\r\n  --padding: " + (/*styles*/ ctx[0].padding ?? /*defaultStyles*/ ctx[1].padding) + ";\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n  --font-weight: " + (/*styles*/ ctx[0].text_weight ?? /*defaultStyles*/ ctx[1].text_weight) + "\r\n");

    			add_location(div, file$7, 39, 0, 1030);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div, "contextmenu", /*contextmenu_handler*/ ctx[6], false, false, false),
    					listen_dev(div, "dblclick", /*dblclick_handler*/ ctx[7], false, false, false),
    					listen_dev(div, "mouseenter", /*mouseenter_handler*/ ctx[8], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(div, "focus", /*focus_handler*/ ctx[10], false, false, false),
    					listen_dev(div, "blur", /*blur_handler*/ ctx[11], false, false, false),
    					listen_dev(div, "mousedown", /*mousedown_handler*/ ctx[12], false, false, false),
    					listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 4 && div_class_value !== (div_class_value = "ui-chip clickable " + (/*$$props*/ ctx[2].class ?? "") + " svelte-1tk2e3v")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*styles*/ 1 && div_style_value !== (div_style_value = "\r\n  " + (/*styles*/ ctx[0].text_underline != null
    			? "--text-underline: " + /*styles*/ ctx[0].text_underline + ";"
    			: "") + "\r\n  --background-color : " + (/*styles*/ ctx[0].background_color ?? /*defaultStyles*/ ctx[1].background_color) + ";\r\n  --text-color : " + (/*styles*/ ctx[0].color ?? /*defaultStyles*/ ctx[1].color) + ";\r\n  --border: 1px solid " + (/*styles*/ ctx[0].color ?? /*defaultStyles*/ ctx[1].color) + ";\r\n  --padding: " + (/*styles*/ ctx[0].padding ?? /*defaultStyles*/ ctx[1].padding) + ";\r\n  --width: " + (/*styles*/ ctx[0].width ?? /*defaultStyles*/ ctx[1].width) + ";\r\n  --font-weight: " + (/*styles*/ ctx[0].text_weight ?? /*defaultStyles*/ ctx[1].text_weight) + "\r\n")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chip", slots, ['default']);
    	
    	let { styles = {} } = $$props;
    	const defaultStyles = DefaultStyles.interface.Chip;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function contextmenu_handler(event) {
    		bubble($$self, event);
    	}

    	function dblclick_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseup_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("styles" in $$new_props) $$invalidate(0, styles = $$new_props.styles);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ DefaultStyles, styles, defaultStyles });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("styles" in $$props) $$invalidate(0, styles = $$new_props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		styles,
    		defaultStyles,
    		$$props,
    		$$scope,
    		slots,
    		click_handler,
    		contextmenu_handler,
    		dblclick_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		mousedown_handler,
    		mouseup_handler
    	];
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get styles() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\circular_frame\CircularFrame.svelte generated by Svelte v3.37.0 */
    const file$6 = "src\\components\\interface\\circular_frame\\CircularFrame.svelte";
    const get_status_slot_changes = dirty => ({});
    const get_status_slot_context = ctx => ({});

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let div2_class_value;
    	let div2_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	const status_slot_template = /*#slots*/ ctx[5].status;
    	const status_slot = create_slot(status_slot_template, ctx, /*$$scope*/ ctx[4], get_status_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			div1 = element("div");
    			if (status_slot) status_slot.c();
    			attr_dev(div0, "class", "fix-ratio svelte-16c115e");
    			add_location(div0, file$6, 56, 2, 1449);
    			attr_dev(div1, "class", "frame-status svelte-16c115e");
    			add_location(div1, file$6, 59, 2, 1500);
    			attr_dev(div2, "class", div2_class_value = "ui-circular-frame " + (/*$$props*/ ctx[3].class ?? "") + " svelte-16c115e");
    			attr_dev(div2, "style", div2_style_value = "\r\n--size : " + (/*size*/ ctx[0] ?? "auto") + ";\r\n--border: " + (/*style*/ ctx[1].border ?? /*defaultStyles*/ ctx[2].border) + ";\r\n--status : " + (/*style*/ ctx[1].status_color ?? /*defaultStyles*/ ctx[2].status_color) + ";\r\n--status-text : " + (/*style*/ ctx[1].status_text_color ?? /*defaultStyles*/ ctx[2].status_text_color) + ";\r\n");
    			add_location(div2, file$6, 50, 0, 1159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (status_slot) {
    				status_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (status_slot) {
    				if (status_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(status_slot, status_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_status_slot_changes, get_status_slot_context);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 8 && div2_class_value !== (div2_class_value = "ui-circular-frame " + (/*$$props*/ ctx[3].class ?? "") + " svelte-16c115e")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*size, style*/ 3 && div2_style_value !== (div2_style_value = "\r\n--size : " + (/*size*/ ctx[0] ?? "auto") + ";\r\n--border: " + (/*style*/ ctx[1].border ?? /*defaultStyles*/ ctx[2].border) + ";\r\n--status : " + (/*style*/ ctx[1].status_color ?? /*defaultStyles*/ ctx[2].status_color) + ";\r\n--status-text : " + (/*style*/ ctx[1].status_text_color ?? /*defaultStyles*/ ctx[2].status_text_color) + ";\r\n")) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(status_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(status_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (status_slot) status_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CircularFrame", slots, ['default','status']);
    	
    	let { size } = $$props;
    	let { style = {} } = $$props;
    	let defaultStyles = DefaultStyles.interface.CircularFrame;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("size" in $$new_props) $$invalidate(0, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(1, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		DefaultStyles,
    		size,
    		style,
    		defaultStyles
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("size" in $$props) $$invalidate(0, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$new_props.style);
    		if ("defaultStyles" in $$props) $$invalidate(2, defaultStyles = $$new_props.defaultStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [size, style, defaultStyles, $$props, $$scope, slots];
    }

    class CircularFrame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { size: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CircularFrame",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[0] === undefined && !("size" in props)) {
    			console.warn("<CircularFrame> was created without expected prop 'size'");
    		}
    	}

    	get size() {
    		throw new Error("<CircularFrame>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<CircularFrame>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CircularFrame>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CircularFrame>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isContextMenuGroup(obj) {
        return (typeof obj.title === "string"
            && obj.spawn_submenu === undefined
            && Array.isArray(obj.items)
            && (typeof obj.icon === "string" || obj.icon == null)
            && (typeof obj.icon_style === "object" || obj.icon_style == null)
            && (typeof obj.enabled === "boolean" || obj.enabled == null));
    }

    /* src\components\interface\context_menu\item\ContextMenuItem.svelte generated by Svelte v3.37.0 */
    const file$5 = "src\\components\\interface\\context_menu\\item\\ContextMenuItem.svelte";

    // (45:2) {#if icon != null}
    function create_if_block$3(ctx) {
    	let div;
    	let svgicon;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: /*icon*/ ctx[1],
    				styles: /*icon_style*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgicon.$$.fragment);
    			attr_dev(div, "class", "ui-cm-item-icon svelte-cd4bvb");
    			add_location(div, file$5, 45, 4, 1081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgicon, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgicon_changes = {};
    			if (dirty & /*icon*/ 2) svgicon_changes.src = /*icon*/ ctx[1];
    			if (dirty & /*icon_style*/ 4) svgicon_changes.styles = /*icon_style*/ ctx[2];
    			svgicon.$set(svgicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(45:2) {#if icon != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[1] != null && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*title*/ ctx[0]);
    			attr_dev(div0, "class", "ui-cm-item-title svelte-cd4bvb");
    			add_location(div0, file$5, 49, 2, 1185);
    			attr_dev(div1, "class", div1_class_value = "ui-context-menu-item  " + (/*enabled*/ ctx[3] ? "clickable" : "disabled") + " svelte-cd4bvb");
    			add_location(div1, file$5, 38, 0, 920);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[1] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*icon*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (!current || dirty & /*enabled*/ 8 && div1_class_value !== (div1_class_value = "ui-context-menu-item  " + (/*enabled*/ ctx[3] ? "clickable" : "disabled") + " svelte-cd4bvb")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContextMenuItem", slots, []);
    	
    	let { title } = $$props;
    	let { icon = null } = $$props;
    	let { icon_style = {} } = $$props;
    	let { enabled = true } = $$props;
    	let { onClick } = $$props;
    	const writable_props = ["title", "icon", "icon_style", "enabled", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContextMenuItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (enabled) onClick();
    	};

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("icon_style" in $$props) $$invalidate(2, icon_style = $$props.icon_style);
    		if ("enabled" in $$props) $$invalidate(3, enabled = $$props.enabled);
    		if ("onClick" in $$props) $$invalidate(4, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		SvgIcon: SVGIcon,
    		title,
    		icon,
    		icon_style,
    		enabled,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("icon_style" in $$props) $$invalidate(2, icon_style = $$props.icon_style);
    		if ("enabled" in $$props) $$invalidate(3, enabled = $$props.enabled);
    		if ("onClick" in $$props) $$invalidate(4, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, icon, icon_style, enabled, onClick, click_handler];
    }

    class ContextMenuItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			title: 0,
    			icon: 1,
    			icon_style: 2,
    			enabled: 3,
    			onClick: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenuItem",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<ContextMenuItem> was created without expected prop 'title'");
    		}

    		if (/*onClick*/ ctx[4] === undefined && !("onClick" in props)) {
    			console.warn("<ContextMenuItem> was created without expected prop 'onClick'");
    		}
    	}

    	get title() {
    		throw new Error("<ContextMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ContextMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<ContextMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ContextMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon_style() {
    		throw new Error("<ContextMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_style(value) {
    		throw new Error("<ContextMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enabled() {
    		throw new Error("<ContextMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enabled(value) {
    		throw new Error("<ContextMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<ContextMenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<ContextMenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isContextMenuSubmenu(obj) {
        return (typeof obj.title === "string"
            && obj.spawn_submenu === true
            && Array.isArray(obj.items)
            && (typeof obj.icon === "string" || obj.icon == null)
            && (typeof obj.icon_style === "string" || obj.icon_style == null)
            && (typeof obj.enabled === "boolean" || obj.enabled == null));
    }

    /* src\components\interface\context_menu\submenu\ContextMenuSubmenu.svelte generated by Svelte v3.37.0 */
    const file$4 = "src\\components\\interface\\context_menu\\submenu\\ContextMenuSubmenu.svelte";

    // (111:4) {#if icon != null}
    function create_if_block$2(ctx) {
    	let svgicon;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: /*icon*/ ctx[2],
    				styles: /*icon_style*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgicon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgicon_changes = {};
    			if (dirty & /*icon*/ 4) svgicon_changes.src = /*icon*/ ctx[2];
    			if (dirty & /*icon_style*/ 8) svgicon_changes.styles = /*icon_style*/ ctx[3];
    			svgicon.$set(svgicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(111:4) {#if icon != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let div2;
    	let svgicon;
    	let t3;
    	let contextmenu;
    	let updating_visible;
    	let updating_position;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[2] != null && create_if_block$2(ctx);

    	svgicon = new SVGIcon({
    			props: {
    				src: "/img/icons/arrow.svg",
    				styles: { .../*icon_style*/ ctx[3], size: "10px" }
    			},
    			$$inline: true
    		});

    	function contextmenu_visible_binding(value) {
    		/*contextmenu_visible_binding*/ ctx[14](value);
    	}

    	function contextmenu_position_binding(value) {
    		/*contextmenu_position_binding*/ ctx[15](value);
    	}

    	let contextmenu_props = {
    		title: /*title*/ ctx[1],
    		items: /*items*/ ctx[4],
    		useContainer: false
    	};

    	if (/*submenuVisibility*/ ctx[5] !== void 0) {
    		contextmenu_props.visible = /*submenuVisibility*/ ctx[5];
    	}

    	if (/*position*/ ctx[7] !== void 0) {
    		contextmenu_props.position = /*position*/ ctx[7];
    	}

    	contextmenu = new ContextMenu({ props: contextmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(contextmenu, "visible", contextmenu_visible_binding));
    	binding_callbacks.push(() => bind(contextmenu, "position", contextmenu_position_binding));
    	contextmenu.$on("mouseenter", /*mouseenter_handler*/ ctx[16]);
    	contextmenu.$on("mouseleave", /*mouseleave_handler*/ ctx[17]);
    	contextmenu.$on("close", /*close_handler*/ ctx[18]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*title*/ ctx[1]);
    			t2 = space();
    			div2 = element("div");
    			create_component(svgicon.$$.fragment);
    			t3 = space();
    			create_component(contextmenu.$$.fragment);
    			attr_dev(div0, "class", "ui-cm-submenu-icon");
    			add_location(div0, file$4, 109, 2, 3172);
    			attr_dev(div1, "class", "ui-cm-submenu-title svelte-1susvmz");
    			add_location(div1, file$4, 114, 2, 3303);
    			attr_dev(div2, "class", "ui-cm-submenu-arrow svelte-1susvmz");
    			add_location(div2, file$4, 117, 2, 3363);
    			attr_dev(div3, "class", div3_class_value = "ui-context-menu-submenu " + (/*enabled*/ ctx[0] ? "" : "disabled") + " svelte-1susvmz");
    			set_style(div3, "pointer-events", "all");
    			add_location(div3, file$4, 80, 0, 2384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(svgicon, div2, null);
    			append_dev(div3, t3);
    			mount_component(contextmenu, div3, null);
    			/*div3_binding*/ ctx[19](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "mouseleave", /*mouseleave_handler_1*/ ctx[20], false, false, false),
    					listen_dev(div3, "mouseenter", /*mouseenter_handler_1*/ ctx[21], false, false, false),
    					listen_dev(div3, "click", stop_propagation(/*click_handler*/ ctx[22]), false, false, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[2] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*icon*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*title*/ 2) set_data_dev(t1, /*title*/ ctx[1]);
    			const svgicon_changes = {};
    			if (dirty & /*icon_style*/ 8) svgicon_changes.styles = { .../*icon_style*/ ctx[3], size: "10px" };
    			svgicon.$set(svgicon_changes);
    			const contextmenu_changes = {};
    			if (dirty & /*title*/ 2) contextmenu_changes.title = /*title*/ ctx[1];
    			if (dirty & /*items*/ 16) contextmenu_changes.items = /*items*/ ctx[4];

    			if (!updating_visible && dirty & /*submenuVisibility*/ 32) {
    				updating_visible = true;
    				contextmenu_changes.visible = /*submenuVisibility*/ ctx[5];
    				add_flush_callback(() => updating_visible = false);
    			}

    			if (!updating_position && dirty & /*position*/ 128) {
    				updating_position = true;
    				contextmenu_changes.position = /*position*/ ctx[7];
    				add_flush_callback(() => updating_position = false);
    			}

    			contextmenu.$set(contextmenu_changes);

    			if (!current || dirty & /*enabled*/ 1 && div3_class_value !== (div3_class_value = "ui-context-menu-submenu " + (/*enabled*/ ctx[0] ? "" : "disabled") + " svelte-1susvmz")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(svgicon.$$.fragment, local);
    			transition_in(contextmenu.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(svgicon.$$.fragment, local);
    			transition_out(contextmenu.$$.fragment, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			destroy_component(svgicon);
    			destroy_component(contextmenu);
    			/*div3_binding*/ ctx[19](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContextMenuSubmenu", slots, []);
    	
    	
    	const spawn_submenu = true;
    	let { enabled = true } = $$props;
    	let { title } = $$props;
    	let { icon = null } = $$props;
    	let { spacing = 2 } = $$props;
    	let { placement = "comfortable" } = $$props;
    	let { icon_style = {} } = $$props;
    	let { items = [] } = $$props;
    	let submenuVisibility = false;
    	let rootEl;
    	let position = { x: "0px", y: "0px" };
    	let delayedDisplayTimeout;
    	let delayedHideTimeout;

    	onMount(() => {
    		let rightPos = placeToTheRight(rootEl.getBoundingClientRect());
    		let leftPos = placeToTheLeft(rootEl.getBoundingClientRect());

    		switch (placement) {
    			case "right":
    				if (rightPos.x - rootEl.getBoundingClientRect().width > 0) {
    					$$invalidate(7, position = {
    						x: rightPos.x - rootEl.getBoundingClientRect().width + "px",
    						y: rightPos.y + "px"
    					});

    					break;
    				}
    			case "left":
    				if (leftPos.x + rootEl.getBoundingClientRect().width < window.innerWidth) {
    					$$invalidate(7, position = { x: leftPos.x + "px", y: leftPos.y + "px" });
    					break;
    				}
    			case "comfortable":
    				let spaceToTheRight = window.innerWidth - (rootEl.getBoundingClientRect().x + rootEl.getBoundingClientRect().width);
    				let spaceToTheLeft = rootEl.getBoundingClientRect().x;
    				if (spaceToTheLeft > spaceToTheRight) {
    					$$invalidate(7, position = { x: leftPos.x + "px", y: leftPos.y + "px" });
    				} else {
    					$$invalidate(7, position = {
    						x: rightPos.x - rootEl.getBoundingClientRect().width + "px",
    						y: rightPos.y + "px"
    					});
    				}
    				break;
    		}
    	});

    	function placeToTheLeft(rect) {
    		return {
    			x: rect.x + rect.width + spacing,
    			y: rect.y
    		};
    	}

    	function placeToTheRight(rect) {
    		return { x: rect.x - spacing, y: rect.y };
    	}

    	function openSubmenu() {
    		$$invalidate(5, submenuVisibility = true);
    	}

    	const writable_props = ["enabled", "title", "icon", "spacing", "placement", "icon_style", "items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContextMenuSubmenu> was created with unknown prop '${key}'`);
    	});

    	function contextmenu_visible_binding(value) {
    		submenuVisibility = value;
    		$$invalidate(5, submenuVisibility);
    	}

    	function contextmenu_position_binding(value) {
    		position = value;
    		$$invalidate(7, position);
    	}

    	const mouseenter_handler = () => {
    		if (delayedHideTimeout != null) {
    			clearTimeout(delayedHideTimeout);
    			$$invalidate(9, delayedHideTimeout = null);
    		}
    	};

    	const mouseleave_handler = () => {
    		$$invalidate(9, delayedHideTimeout = setTimeout(
    			() => {
    				
    			},
    			700
    		)); //submenuVisibility = false;
    		//submenuVisibility = false;
    	};

    	function close_handler(event) {
    		bubble($$self, event);
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rootEl = $$value;
    			$$invalidate(6, rootEl);
    		});
    	}

    	const mouseleave_handler_1 = () => {
    		if (delayedHideTimeout == null) {
    			$$invalidate(9, delayedHideTimeout = setTimeout(
    				() => {
    					//submenuVisibility = false;
    					$$invalidate(9, delayedHideTimeout = null);
    				},
    				300
    			));
    		}
    	};

    	const mouseenter_handler_1 = () => {
    		if (delayedHideTimeout != null) {
    			clearTimeout(delayedHideTimeout);
    			$$invalidate(9, delayedHideTimeout = null);
    		}

    		if (delayedDisplayTimeout == null) {
    			$$invalidate(8, delayedDisplayTimeout = setTimeout(
    				() => {
    					openSubmenu();
    					$$invalidate(8, delayedDisplayTimeout = null);
    				},
    				300
    			));
    		}
    	};

    	const click_handler = () => {
    		if (enabled) openSubmenu();
    	};

    	$$self.$$set = $$props => {
    		if ("enabled" in $$props) $$invalidate(0, enabled = $$props.enabled);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(2, icon = $$props.icon);
    		if ("spacing" in $$props) $$invalidate(12, spacing = $$props.spacing);
    		if ("placement" in $$props) $$invalidate(13, placement = $$props.placement);
    		if ("icon_style" in $$props) $$invalidate(3, icon_style = $$props.icon_style);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		SvgIcon: SVGIcon,
    		ContextMenu,
    		fade,
    		spawn_submenu,
    		enabled,
    		title,
    		icon,
    		spacing,
    		placement,
    		icon_style,
    		items,
    		submenuVisibility,
    		rootEl,
    		position,
    		delayedDisplayTimeout,
    		delayedHideTimeout,
    		placeToTheLeft,
    		placeToTheRight,
    		openSubmenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("enabled" in $$props) $$invalidate(0, enabled = $$props.enabled);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(2, icon = $$props.icon);
    		if ("spacing" in $$props) $$invalidate(12, spacing = $$props.spacing);
    		if ("placement" in $$props) $$invalidate(13, placement = $$props.placement);
    		if ("icon_style" in $$props) $$invalidate(3, icon_style = $$props.icon_style);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("submenuVisibility" in $$props) $$invalidate(5, submenuVisibility = $$props.submenuVisibility);
    		if ("rootEl" in $$props) $$invalidate(6, rootEl = $$props.rootEl);
    		if ("position" in $$props) $$invalidate(7, position = $$props.position);
    		if ("delayedDisplayTimeout" in $$props) $$invalidate(8, delayedDisplayTimeout = $$props.delayedDisplayTimeout);
    		if ("delayedHideTimeout" in $$props) $$invalidate(9, delayedHideTimeout = $$props.delayedHideTimeout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		enabled,
    		title,
    		icon,
    		icon_style,
    		items,
    		submenuVisibility,
    		rootEl,
    		position,
    		delayedDisplayTimeout,
    		delayedHideTimeout,
    		openSubmenu,
    		spawn_submenu,
    		spacing,
    		placement,
    		contextmenu_visible_binding,
    		contextmenu_position_binding,
    		mouseenter_handler,
    		mouseleave_handler,
    		close_handler,
    		div3_binding,
    		mouseleave_handler_1,
    		mouseenter_handler_1,
    		click_handler
    	];
    }

    class ContextMenuSubmenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			spawn_submenu: 11,
    			enabled: 0,
    			title: 1,
    			icon: 2,
    			spacing: 12,
    			placement: 13,
    			icon_style: 3,
    			items: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenuSubmenu",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<ContextMenuSubmenu> was created without expected prop 'title'");
    		}
    	}

    	get spawn_submenu() {
    		return this.$$.ctx[11];
    	}

    	set spawn_submenu(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enabled() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enabled(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spacing() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spacing(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placement() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placement(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon_style() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_style(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ContextMenuSubmenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\interface\context_menu\group\ContextMenuGroup.svelte generated by Svelte v3.37.0 */
    const file$3 = "src\\components\\interface\\context_menu\\group\\ContextMenuGroup.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (28:4) {#if icon != null}
    function create_if_block_1$1(ctx) {
    	let div;
    	let svgicon;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: /*icon*/ ctx[1],
    				styles: /*icon_style*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(svgicon.$$.fragment);
    			attr_dev(div, "class", "ui-cm-item-icon");
    			add_location(div, file$3, 28, 6, 778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(svgicon, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgicon_changes = {};
    			if (dirty & /*icon*/ 2) svgicon_changes.src = /*icon*/ ctx[1];
    			if (dirty & /*icon_style*/ 4) svgicon_changes.styles = /*icon_style*/ ctx[2];
    			svgicon.$set(svgicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(28:4) {#if icon != null}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {:else}
    function create_else_block$1(ctx) {
    	let contextmenuitem;
    	let current;

    	const contextmenuitem_spread_levels = [
    		{
    			.../*item*/ ctx[6],
    			enabled: /*enabled*/ ctx[3] === true
    			? /*item*/ ctx[6].enabled ?? true
    			: false
    		}
    	];

    	let contextmenuitem_props = {};

    	for (let i = 0; i < contextmenuitem_spread_levels.length; i += 1) {
    		contextmenuitem_props = assign(contextmenuitem_props, contextmenuitem_spread_levels[i]);
    	}

    	contextmenuitem = new ContextMenuItem({
    			props: contextmenuitem_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextmenuitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenuitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenuitem_changes = (dirty & /*items, enabled*/ 24)
    			? get_spread_update(contextmenuitem_spread_levels, [
    					{
    						.../*item*/ ctx[6],
    						enabled: /*enabled*/ ctx[3] === true
    						? /*item*/ ctx[6].enabled ?? true
    						: false
    					}
    				])
    			: {};

    			contextmenuitem.$set(contextmenuitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenuitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(43:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if isContextMenuSubmenu(item)}
    function create_if_block$1(ctx) {
    	let contextmenusubmenu;
    	let current;

    	const contextmenusubmenu_spread_levels = [
    		{
    			.../*item*/ ctx[6],
    			enabled: /*enabled*/ ctx[3] === true
    			? /*item*/ ctx[6].enabled ?? true
    			: false
    		}
    	];

    	let contextmenusubmenu_props = {};

    	for (let i = 0; i < contextmenusubmenu_spread_levels.length; i += 1) {
    		contextmenusubmenu_props = assign(contextmenusubmenu_props, contextmenusubmenu_spread_levels[i]);
    	}

    	contextmenusubmenu = new ContextMenuSubmenu({
    			props: contextmenusubmenu_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextmenusubmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenusubmenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenusubmenu_changes = (dirty & /*items, enabled*/ 24)
    			? get_spread_update(contextmenusubmenu_spread_levels, [
    					{
    						.../*item*/ ctx[6],
    						enabled: /*enabled*/ ctx[3] === true
    						? /*item*/ ctx[6].enabled ?? true
    						: false
    					}
    				])
    			: {};

    			contextmenusubmenu.$set(contextmenusubmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenusubmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenusubmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenusubmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(36:4) {#if isContextMenuSubmenu(item)}",
    		ctx
    	});

    	return block;
    }

    // (35:2) {#each items as item}
    function create_each_block$1(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*items*/ 16) show_if = !!isContextMenuSubmenu(/*item*/ ctx[6]);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(35:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[1] != null && create_if_block_1$1(ctx);
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "ui-cm-group-title svelte-16anp2j");
    			add_location(div0, file$3, 26, 2, 715);
    			attr_dev(div1, "class", div1_class_value = "ui-context-menu-group  " + (/*enabled*/ ctx[3] ? "clickable" : "disabled"));
    			add_location(div1, file$3, 22, 0, 605);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", stop_propagation(/*click_handler*/ ctx[5]), false, false, true);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[1] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*icon*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (dirty & /*items, enabled, isContextMenuSubmenu*/ 24) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*enabled*/ 8 && div1_class_value !== (div1_class_value = "ui-context-menu-group  " + (/*enabled*/ ctx[3] ? "clickable" : "disabled"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContextMenuGroup", slots, []);
    	
    	
    	let { title } = $$props;
    	let { icon = null } = $$props;
    	let { icon_style = {} } = $$props;
    	let { enabled = true } = $$props;
    	let { items = [] } = $$props;
    	const writable_props = ["title", "icon", "icon_style", "enabled", "items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContextMenuGroup> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("icon_style" in $$props) $$invalidate(2, icon_style = $$props.icon_style);
    		if ("enabled" in $$props) $$invalidate(3, enabled = $$props.enabled);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		SvgIcon: SVGIcon,
    		ContextMenuItem,
    		isContextMenuSubmenu,
    		ContextMenuSubmenu,
    		title,
    		icon,
    		icon_style,
    		enabled,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("icon_style" in $$props) $$invalidate(2, icon_style = $$props.icon_style);
    		if ("enabled" in $$props) $$invalidate(3, enabled = $$props.enabled);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, icon, icon_style, enabled, items, click_handler];
    }

    class ContextMenuGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			title: 0,
    			icon: 1,
    			icon_style: 2,
    			enabled: 3,
    			items: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenuGroup",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<ContextMenuGroup> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<ContextMenuGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ContextMenuGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<ContextMenuGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<ContextMenuGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon_style() {
    		throw new Error("<ContextMenuGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon_style(value) {
    		throw new Error("<ContextMenuGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get enabled() {
    		throw new Error("<ContextMenuGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set enabled(value) {
    		throw new Error("<ContextMenuGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<ContextMenuGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ContextMenuGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isContextMenuItem(obj) {
        return (typeof obj.title === "string"
            && typeof obj.onClick === "function"
            && (typeof obj.icon === "string" || obj.icon == null)
            && (typeof obj.icon_color === "string" || obj.icon_color == null)
            && (typeof obj.enabled === "boolean" || obj.enabled == null));
    }

    /* src\components\interface\context_menu\ContextMenu.svelte generated by Svelte v3.37.0 */
    const file$2 = "src\\components\\interface\\context_menu\\ContextMenu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (42:0) {#if visible === true}
    function create_if_block(ctx) {
    	let t0;
    	let div;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*useContainer*/ ctx[2] === true && create_if_block_5(ctx);
    	let if_block1 = /*title*/ ctx[3] != null && create_if_block_4(ctx);
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "ui-context-menu svelte-bq3eoh");
    			set_style(div, "--position-x", /*position*/ ctx[1].x);
    			set_style(div, "--position-y", /*position*/ ctx[1].y + "\r\n    ");
    			add_location(div, file$2, 52, 2, 1622);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", stop_propagation(/*click_handler*/ ctx[6]), false, false, true),
    					listen_dev(div, "mouseenter", /*mouseenter_handler*/ ctx[7], false, false, false),
    					listen_dev(div, "mouseleave", /*mouseleave_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*useContainer*/ ctx[2] === true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*useContainer*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*title*/ ctx[3] != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*items, isContextMenuGroup, isContextMenuItem, visible, isContextMenuSubmenu*/ 17) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*position*/ 2) {
    				set_style(div, "--position-x", /*position*/ ctx[1].x);
    			}

    			if (!current || dirty & /*position*/ 2) {
    				set_style(div, "--position-y", /*position*/ ctx[1].y + "\r\n    ");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:0) {#if visible === true}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if useContainer === true}
    function create_if_block_5(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "ui-context-menu-overlay svelte-bq3eoh");
    			add_location(div, file$2, 43, 4, 1424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(43:2) {#if useContainer === true}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if title != null}
    function create_if_block_4(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*title*/ ctx[3]);
    			attr_dev(div, "class", "ui-cm-title svelte-bq3eoh");
    			add_location(div, file$2, 63, 6, 1846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 8) set_data_dev(t, /*title*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(63:4) {#if title != null}",
    		ctx
    	});

    	return block;
    }

    // (80:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cant render this item!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(80:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:43) 
    function create_if_block_3(ctx) {
    	let contextmenusubmenu;
    	let current;
    	const contextmenusubmenu_spread_levels = [/*item*/ ctx[14]];
    	let contextmenusubmenu_props = {};

    	for (let i = 0; i < contextmenusubmenu_spread_levels.length; i += 1) {
    		contextmenusubmenu_props = assign(contextmenusubmenu_props, contextmenusubmenu_spread_levels[i]);
    	}

    	contextmenusubmenu = new ContextMenuSubmenu({
    			props: contextmenusubmenu_props,
    			$$inline: true
    		});

    	contextmenusubmenu.$on("close", /*close_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(contextmenusubmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenusubmenu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenusubmenu_changes = (dirty & /*items*/ 16)
    			? get_spread_update(contextmenusubmenu_spread_levels, [get_spread_object(/*item*/ ctx[14])])
    			: {};

    			contextmenusubmenu.$set(contextmenusubmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenusubmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenusubmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenusubmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(73:43) ",
    		ctx
    	});

    	return block;
    }

    // (71:40) 
    function create_if_block_2(ctx) {
    	let contextmenuitem;
    	let current;
    	const contextmenuitem_spread_levels = [/*item*/ ctx[14]];
    	let contextmenuitem_props = {};

    	for (let i = 0; i < contextmenuitem_spread_levels.length; i += 1) {
    		contextmenuitem_props = assign(contextmenuitem_props, contextmenuitem_spread_levels[i]);
    	}

    	contextmenuitem = new ContextMenuItem({
    			props: contextmenuitem_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextmenuitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenuitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenuitem_changes = (dirty & /*items*/ 16)
    			? get_spread_update(contextmenuitem_spread_levels, [get_spread_object(/*item*/ ctx[14])])
    			: {};

    			contextmenuitem.$set(contextmenuitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenuitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenuitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenuitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(71:40) ",
    		ctx
    	});

    	return block;
    }

    // (69:6) {#if isContextMenuGroup(item)}
    function create_if_block_1(ctx) {
    	let contextmenugroup;
    	let current;
    	const contextmenugroup_spread_levels = [/*item*/ ctx[14]];
    	let contextmenugroup_props = {};

    	for (let i = 0; i < contextmenugroup_spread_levels.length; i += 1) {
    		contextmenugroup_props = assign(contextmenugroup_props, contextmenugroup_spread_levels[i]);
    	}

    	contextmenugroup = new ContextMenuGroup({
    			props: contextmenugroup_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextmenugroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextmenugroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextmenugroup_changes = (dirty & /*items*/ 16)
    			? get_spread_update(contextmenugroup_spread_levels, [get_spread_object(/*item*/ ctx[14])])
    			: {};

    			contextmenugroup.$set(contextmenugroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextmenugroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextmenugroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextmenugroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(69:6) {#if isContextMenuGroup(item)}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#each items as item}
    function create_each_block(ctx) {
    	let show_if;
    	let show_if_1;
    	let show_if_2;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*items*/ 16) show_if = !!isContextMenuGroup(/*item*/ ctx[14]);
    		if (show_if) return 0;
    		if (dirty & /*items*/ 16) show_if_1 = !!isContextMenuItem(/*item*/ ctx[14]);
    		if (show_if_1) return 1;
    		if (dirty & /*items*/ 16) show_if_2 = !!isContextMenuSubmenu(/*item*/ ctx[14]);
    		if (show_if_2) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(68:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[0] === true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContextMenu", slots, []);
    	
    	
    	
    	let { visible = false } = $$props;
    	let { position = { x: "0", y: "0" } } = $$props;
    	let { useContainer = true } = $$props;
    	let { title } = $$props;
    	let { items = [] } = $$props;

    	afterUpdate(() => {
    		
    	});

    	const endOnScrollListener = () => {
    		hideThisCM();
    	};

    	const closeOnEscPress = ev => {
    		if (ev.key === "Escape") {
    			ev.stopPropagation();
    			hideThisCM();
    		}
    	};

    	const signalClose = createEventDispatcher();

    	onMount(() => {
    		document.addEventListener("scroll", endOnScrollListener, { passive: true });
    		document.addEventListener("keydown", closeOnEscPress);

    		return () => {
    			document.removeEventListener("scroll", endOnScrollListener);
    			document.removeEventListener("keydown", closeOnEscPress);
    		};
    	});

    	function hideThisCM() {
    		$$invalidate(0, visible = false);
    		signalClose("close");
    	}

    	const writable_props = ["visible", "position", "useContainer", "title", "items"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContextMenu> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler_1 = ev => {
    		hideThisCM();
    		ev.stopPropagation();
    	};

    	const close_handler = () => {
    		$$invalidate(0, visible = false);
    	};

    	$$self.$$set = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("useContainer" in $$props) $$invalidate(2, useContainer = $$props.useContainer);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		isContextMenuGroup,
    		ContextMenuGroup,
    		isContextMenuItem,
    		isContextMenuSubmenu,
    		ContextMenuItem,
    		ContextMenuSubmenu,
    		afterUpdate,
    		createEventDispatcher,
    		onMount,
    		fade,
    		visible,
    		position,
    		useContainer,
    		title,
    		items,
    		endOnScrollListener,
    		closeOnEscPress,
    		signalClose,
    		hideThisCM
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("useContainer" in $$props) $$invalidate(2, useContainer = $$props.useContainer);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		visible,
    		position,
    		useContainer,
    		title,
    		items,
    		hideThisCM,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		click_handler_1,
    		close_handler
    	];
    }

    class ContextMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			visible: 0,
    			position: 1,
    			useContainer: 2,
    			title: 3,
    			items: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextMenu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[3] === undefined && !("title" in props)) {
    			console.warn("<ContextMenu> was created without expected prop 'title'");
    		}
    	}

    	get visible() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useContainer() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useContainer(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<ContextMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<ContextMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\UIKit.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\UIKit.svelte";

    // (90:1) <DimmedButton    on:click={() => {     if ($CurrentTheme.name === "light") {      $CurrentTheme = DarkTheme;     } else {      $CurrentTheme = LightInterfaceTheme;     }    }}>
    function create_default_slot_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Change theme");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(90:1) <DimmedButton    on:click={() => {     if ($CurrentTheme.name === \\\"light\\\") {      $CurrentTheme = DarkTheme;     } else {      $CurrentTheme = LightInterfaceTheme;     }    }}>",
    		ctx
    	});

    	return block;
    }

    // (107:5) <BreadcrumbItem class="clickable">
    function create_default_slot_14(ctx) {
    	let svgicon;
    	let t;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: "/img/icons/menu.svg",
    				styles: { margin: "0 7px 0 0" }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgicon.$$.fragment);
    			t = text(" Menu");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgicon, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgicon, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(107:5) <BreadcrumbItem class=\\\"clickable\\\">",
    		ctx
    	});

    	return block;
    }

    // (113:5) <BreadcrumbItem class="clickable">
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submenu");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(113:5) <BreadcrumbItem class=\\\"clickable\\\">",
    		ctx
    	});

    	return block;
    }

    // (114:5) <BreadcrumbItem>
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Another Submenu");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(114:5) <BreadcrumbItem>",
    		ctx
    	});

    	return block;
    }

    // (106:4) <Breadcrumb separator="▶️" styles={{ width: "100%" }}>
    function create_default_slot_11(ctx) {
    	let breadcrumbitem0;
    	let t0;
    	let breadcrumbitem1;
    	let t1;
    	let breadcrumbitem2;
    	let current;

    	breadcrumbitem0 = new BreadcrumbItem({
    			props: {
    				class: "clickable",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	breadcrumbitem1 = new BreadcrumbItem({
    			props: {
    				class: "clickable",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	breadcrumbitem2 = new BreadcrumbItem({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(breadcrumbitem0.$$.fragment);
    			t0 = space();
    			create_component(breadcrumbitem1.$$.fragment);
    			t1 = space();
    			create_component(breadcrumbitem2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(breadcrumbitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(breadcrumbitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(breadcrumbitem2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const breadcrumbitem0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				breadcrumbitem0_changes.$$scope = { dirty, ctx };
    			}

    			breadcrumbitem0.$set(breadcrumbitem0_changes);
    			const breadcrumbitem1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				breadcrumbitem1_changes.$$scope = { dirty, ctx };
    			}

    			breadcrumbitem1.$set(breadcrumbitem1_changes);
    			const breadcrumbitem2_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				breadcrumbitem2_changes.$$scope = { dirty, ctx };
    			}

    			breadcrumbitem2.$set(breadcrumbitem2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(breadcrumbitem0.$$.fragment, local);
    			transition_in(breadcrumbitem1.$$.fragment, local);
    			transition_in(breadcrumbitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(breadcrumbitem0.$$.fragment, local);
    			transition_out(breadcrumbitem1.$$.fragment, local);
    			transition_out(breadcrumbitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(breadcrumbitem0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(breadcrumbitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(breadcrumbitem2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(106:4) <Breadcrumb separator=\\\"▶️\\\" styles={{ width: \\\"100%\\\" }}>",
    		ctx
    	});

    	return block;
    }

    // (162:4) <Button>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Button");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(162:4) <Button>",
    		ctx
    	});

    	return block;
    }

    // (163:4) <DimmedButton>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Dimmed Button");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(163:4) <DimmedButton>",
    		ctx
    	});

    	return block;
    }

    // (165:4) <OutlineButton>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Outline Button");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(165:4) <OutlineButton>",
    		ctx
    	});

    	return block;
    }

    // (166:4) <TextButton>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Text Button");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(166:4) <TextButton>",
    		ctx
    	});

    	return block;
    }

    // (227:5) 
    function create_image_slot(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/card_image.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image");
    			attr_dev(img, "slot", "image");
    			attr_dev(img, "alt", "card header");
    			add_location(img, file$1, 226, 5, 7198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_image_slot.name,
    		type: "slot",
    		source: "(227:5) ",
    		ctx
    	});

    	return block;
    }

    // (233:5) 
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Title of the card";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$1, 232, 5, 7318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(233:5) ",
    		ctx
    	});

    	return block;
    }

    // (234:5) 
    function create_description_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Description of the card";
    			attr_dev(span, "slot", "description");
    			add_location(span, file$1, 233, 5, 7368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_description_slot.name,
    		type: "slot",
    		source: "(234:5) ",
    		ctx
    	});

    	return block;
    }

    // (235:5) 
    function create_actions_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Actions of the card!";
    			attr_dev(span, "slot", "actions");
    			add_location(span, file$1, 234, 5, 7430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot.name,
    		type: "slot",
    		source: "(235:5) ",
    		ctx
    	});

    	return block;
    }

    // (292:4) <Chip>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Chip");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(292:4) <Chip>",
    		ctx
    	});

    	return block;
    }

    // (293:4) <Chip       styles={{        color: "var(--secondary-color)",        background_color: "var(--secondary-color-25)",       }}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Colored Chip");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(293:4) <Chip       styles={{        color: \\\"var(--secondary-color)\\\",        background_color: \\\"var(--secondary-color-25)\\\",       }}>",
    		ctx
    	});

    	return block;
    }

    // (333:4) <CircularFrame style={{ status_color: "transparent" }} size="60px">
    function create_default_slot_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/card_image.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image");
    			attr_dev(img, "alt", "card header");
    			add_location(img, file$1, 333, 5, 10716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(333:4) <CircularFrame style={{ status_color: \\\"transparent\\\" }} size=\\\"60px\\\">",
    		ctx
    	});

    	return block;
    }

    // (336:4) <CircularFrame size="60px">
    function create_default_slot_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/card_image.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image");
    			attr_dev(img, "alt", "card header");
    			add_location(img, file$1, 336, 5, 10844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(336:4) <CircularFrame size=\\\"60px\\\">",
    		ctx
    	});

    	return block;
    }

    // (339:4) <CircularFrame size="60px">
    function create_default_slot_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/card_image.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image");
    			attr_dev(img, "alt", "card header");
    			add_location(img, file$1, 339, 5, 10972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(339:4) <CircularFrame size=\\\"60px\\\">",
    		ctx
    	});

    	return block;
    }

    // (341:5) 
    function create_status_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "10";
    			attr_dev(span, "slot", "status");
    			add_location(span, file$1, 340, 5, 11045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_status_slot_1.name,
    		type: "slot",
    		source: "(341:5) ",
    		ctx
    	});

    	return block;
    }

    // (343:4) <CircularFrame size="60px">
    function create_default_slot_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "/img/card_image.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "image");
    			attr_dev(img, "alt", "card header");
    			add_location(img, file$1, 343, 5, 11138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(343:4) <CircularFrame size=\\\"60px\\\">",
    		ctx
    	});

    	return block;
    }

    // (346:5) 
    function create_status_slot(ctx) {
    	let svgicon;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				class: "clickable",
    				slot: "status",
    				src: "/img/icons/reload.svg",
    				styles: { size: "12px", color: "white" }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgicon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_status_slot.name,
    		type: "slot",
    		source: "(346:5) ",
    		ctx
    	});

    	return block;
    }

    // (387:4) <Button on:contextmenu={openContextMenu}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Right click me");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(387:4) <Button on:contextmenu={openContextMenu}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div30;
    	let h1;
    	let iconbutton;
    	let svgicon;
    	let t0;
    	let t1;
    	let dimmedbutton0;
    	let t2;
    	let lineseparator;
    	let t3;
    	let h30;
    	let t5;
    	let br0;
    	let t6;
    	let sector;
    	let div2;
    	let div0;
    	let breadcrumb;
    	let t7;
    	let div1;
    	let h31;
    	let t9;
    	let h40;
    	let t11;
    	let ul0;
    	let li0;
    	let t13;
    	let h41;
    	let t15;
    	let ul1;
    	let li1;
    	let b0;
    	let t17;
    	let t18;
    	let li2;
    	let b1;
    	let t20;
    	let t21;
    	let li3;
    	let b2;
    	let t23;
    	let t24;
    	let li4;
    	let b3;
    	let t26;
    	let t27;
    	let li5;
    	let b4;
    	let t29;
    	let t30;
    	let div5;
    	let div3;
    	let button0;
    	let t31;
    	let dimmedbutton1;
    	let t32;
    	let br1;
    	let t33;
    	let outlinebutton;
    	let t34;
    	let textbutton;
    	let t35;
    	let div4;
    	let h32;
    	let t37;
    	let h42;
    	let t39;
    	let ul2;
    	let li6;
    	let b5;
    	let t41;
    	let t42;
    	let li7;
    	let b6;
    	let t44;
    	let t45;
    	let li8;
    	let b7;
    	let t47;
    	let t48;
    	let li9;
    	let b8;
    	let t50;
    	let t51;
    	let h43;
    	let t53;
    	let ul3;
    	let li10;
    	let b9;
    	let t55;
    	let t56;
    	let li11;
    	let b10;
    	let t58;
    	let t59;
    	let li12;
    	let b11;
    	let t61;
    	let t62;
    	let li13;
    	let b12;
    	let t64;
    	let t65;
    	let li14;
    	let b13;
    	let t67;
    	let t68;
    	let li15;
    	let b14;
    	let t70;
    	let t71;
    	let div8;
    	let div6;
    	let card;
    	let t72;
    	let div7;
    	let h33;
    	let t74;
    	let h44;
    	let t76;
    	let ul4;
    	let li16;
    	let b15;
    	let t78;
    	let t79;
    	let li17;
    	let b16;
    	let t81;
    	let t82;
    	let li18;
    	let b17;
    	let t84;
    	let t85;
    	let li19;
    	let b18;
    	let t87;
    	let t88;
    	let h45;
    	let t90;
    	let ul5;
    	let li20;
    	let b19;
    	let t92;
    	let t93;
    	let li21;
    	let b20;
    	let t95;
    	let t96;
    	let li22;
    	let b21;
    	let t98;
    	let t99;
    	let li23;
    	let b22;
    	let t101;
    	let t102;
    	let li24;
    	let b23;
    	let t104;
    	let t105;
    	let div11;
    	let div9;
    	let chip0;
    	let t106;
    	let chip1;
    	let t107;
    	let div10;
    	let h34;
    	let t109;
    	let h46;
    	let t111;
    	let ul6;
    	let li25;
    	let b24;
    	let t113;
    	let t114;
    	let li26;
    	let b25;
    	let t116;
    	let t117;
    	let li27;
    	let b26;
    	let t119;
    	let t120;
    	let li28;
    	let b27;
    	let t122;
    	let t123;
    	let li29;
    	let b28;
    	let t125;
    	let t126;
    	let div14;
    	let div12;
    	let circularframe0;
    	let t127;
    	let circularframe1;
    	let t128;
    	let circularframe2;
    	let t129;
    	let circularframe3;
    	let t130;
    	let div13;
    	let h35;
    	let t132;
    	let h47;
    	let t134;
    	let ul7;
    	let li30;
    	let b29;
    	let t136;
    	let t137;
    	let li31;
    	let b30;
    	let t139;
    	let t140;
    	let li32;
    	let b31;
    	let t142;
    	let t143;
    	let li33;
    	let b32;
    	let t145;
    	let t146;
    	let li34;
    	let b33;
    	let t148;
    	let t149;
    	let div17;
    	let div15;
    	let button1;
    	let t150;
    	let contextmenu;
    	let updating_visible;
    	let updating_position;
    	let t151;
    	let div16;
    	let h36;
    	let t153;
    	let h48;
    	let t155;
    	let ul8;
    	let li35;
    	let b34;
    	let t157;
    	let t158;
    	let li36;
    	let b35;
    	let t160;
    	let t161;
    	let li37;
    	let b36;
    	let t163;
    	let t164;
    	let li38;
    	let b37;
    	let t166;
    	let t167;
    	let li39;
    	let b38;
    	let t169;
    	let t170;
    	let div18;
    	let h49;
    	let t172;
    	let div19;
    	let h410;
    	let t174;
    	let div20;
    	let h411;
    	let t176;
    	let div21;
    	let h412;
    	let t178;
    	let div22;
    	let h413;
    	let t180;
    	let div23;
    	let h414;
    	let t182;
    	let div24;
    	let h415;
    	let t184;
    	let div25;
    	let h416;
    	let t186;
    	let div26;
    	let h417;
    	let t188;
    	let div27;
    	let h418;
    	let t190;
    	let div28;
    	let h419;
    	let t192;
    	let div29;
    	let h420;
    	let div30_transition;
    	let current;

    	iconbutton = new IconButton({
    			props: { src: "/img/icons/back.svg" },
    			$$inline: true
    		});

    	iconbutton.$on("click", /*click_handler*/ ctx[5]);

    	svgicon = new SVGIcon({
    			props: { src: "/img/harmony.logo.svg" },
    			$$inline: true
    		});

    	dimmedbutton0 = new DimmedButton({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	dimmedbutton0.$on("click", /*click_handler_1*/ ctx[6]);
    	lineseparator = new LineSeparator({ $$inline: true });

    	breadcrumb = new Breadcrumb({
    			props: {
    				separator: "▶️",
    				styles: { width: "100%" },
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	dimmedbutton1 = new DimmedButton({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	outlinebutton = new OutlineButton({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	textbutton = new TextButton({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card = new Card({
    			props: {
    				styles: { image_max_height: "100px" },
    				$$slots: {
    					actions: [create_actions_slot],
    					description: [create_description_slot],
    					title: [create_title_slot],
    					image: [create_image_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	chip0 = new Chip({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	chip1 = new Chip({
    			props: {
    				styles: {
    					color: "var(--secondary-color)",
    					background_color: "var(--secondary-color-25)"
    				},
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	circularframe0 = new CircularFrame({
    			props: {
    				style: { status_color: "transparent" },
    				size: "60px",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	circularframe1 = new CircularFrame({
    			props: {
    				size: "60px",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	circularframe2 = new CircularFrame({
    			props: {
    				size: "60px",
    				$$slots: {
    					status: [create_status_slot_1],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	circularframe3 = new CircularFrame({
    			props: {
    				size: "60px",
    				$$slots: {
    					status: [create_status_slot],
    					default: [create_default_slot_1$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("contextmenu", /*openContextMenu*/ ctx[4]);

    	function contextmenu_visible_binding(value) {
    		/*contextmenu_visible_binding*/ ctx[7](value);
    	}

    	function contextmenu_position_binding(value) {
    		/*contextmenu_position_binding*/ ctx[8](value);
    	}

    	let contextmenu_props = {
    		title: "Context Menu",
    		items: /*CMItems*/ ctx[3]
    	};

    	if (/*cmVisibility*/ ctx[0] !== void 0) {
    		contextmenu_props.visible = /*cmVisibility*/ ctx[0];
    	}

    	if (/*cmPosition*/ ctx[1] !== void 0) {
    		contextmenu_props.position = /*cmPosition*/ ctx[1];
    	}

    	contextmenu = new ContextMenu({ props: contextmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(contextmenu, "visible", contextmenu_visible_binding));
    	binding_callbacks.push(() => bind(contextmenu, "position", contextmenu_position_binding));

    	const block = {
    		c: function create() {
    			div30 = element("div");
    			h1 = element("h1");
    			create_component(iconbutton.$$.fragment);
    			create_component(svgicon.$$.fragment);
    			t0 = text(" Harmony UI Kit");
    			t1 = space();
    			create_component(dimmedbutton0.$$.fragment);
    			t2 = space();
    			create_component(lineseparator.$$.fragment);
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "Interface Components";
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			sector = element("sector");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(breadcrumb.$$.fragment);
    			t7 = space();
    			div1 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Breadcrumb";
    			t9 = space();
    			h40 = element("h4");
    			h40.textContent = "➡️ Properties";
    			t11 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "separator: which glyph shall be used to separate items inside the\r\n\t\t\t\t\t\tBreadcrumb";
    			t13 = space();
    			h41 = element("h4");
    			h41.textContent = "➡️ Styling";
    			t15 = space();
    			ul1 = element("ul");
    			li1 = element("li");
    			b0 = element("b");
    			b0.textContent = "background_color:";
    			t17 = text(" color to be used as the breadcrumb background,\r\n\t\t\t\t\t\tdirectly inserted into 'background-color' css property, accepts all the\r\n\t\t\t\t\t\tvalues that are valid background colors");
    			t18 = space();
    			li2 = element("li");
    			b1 = element("b");
    			b1.textContent = "separator_color:";
    			t20 = text(" color to be used as the separator color, directly\r\n\t\t\t\t\t\tinserted into 'color' css property, accepts all the values that are valid\r\n\t\t\t\t\t\tcolors");
    			t21 = space();
    			li3 = element("li");
    			b2 = element("b");
    			b2.textContent = "separator_color:";
    			t23 = text(" font size to be used for the separator, directly\r\n\t\t\t\t\t\tinserted into 'font-size' css property, accepts all the values that are\r\n\t\t\t\t\t\tvalid font sizes");
    			t24 = space();
    			li4 = element("li");
    			b3 = element("b");
    			b3.textContent = "separator_weight:";
    			t26 = text(" font weight to be used for the separator, directly\r\n\t\t\t\t\t\tinserted into 'font-weight' css property, accepts all the values that\r\n\t\t\t\t\t\tare valid font weight (number | 'bold' | 'nomral' | 'thin' | 'lighter'\r\n\t\t\t\t\t\t| ...)");
    			t27 = space();
    			li5 = element("li");
    			b4 = element("b");
    			b4.textContent = "fade_ratio:";
    			t29 = text(" increasingly decrements opacity when closer to the\r\n\t\t\t\t\t\torigin, must be a number between 0-1, 0 means 'no fading' 1 means only\r\n\t\t\t\t\t\tthe last element shall be visible");
    			t30 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(button0.$$.fragment);
    			t31 = space();
    			create_component(dimmedbutton1.$$.fragment);
    			t32 = space();
    			br1 = element("br");
    			t33 = space();
    			create_component(outlinebutton.$$.fragment);
    			t34 = space();
    			create_component(textbutton.$$.fragment);
    			t35 = space();
    			div4 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Button";
    			t37 = space();
    			h42 = element("h4");
    			h42.textContent = "➡️ Variations";
    			t39 = text("\r\n\t\t\t\tAll of the variations are just styling modifications of the Button class,\r\n\t\t\t\tthey posses the same functionality and expose the same DOM Events\r\n\t\t\t\t");
    			ul2 = element("ul");
    			li6 = element("li");
    			b5 = element("b");
    			b5.textContent = "Filled Button:";
    			t41 = text(" is the default styling tor the 'Button' component,\r\n\t\t\t\t\t\tfilled button using the default box-shadow property");
    			t42 = space();
    			li7 = element("li");
    			b6 = element("b");
    			b6.textContent = "Dimmed Button:";
    			t44 = text(" filled button with less accent, good for secondary\r\n\t\t\t\t\t\tactions");
    			t45 = space();
    			li8 = element("li");
    			b7 = element("b");
    			b7.textContent = "Outline Button:";
    			t47 = text(" not filled button with a soft border, has no elevation\r\n\t\t\t\t\t\tattached");
    			t48 = space();
    			li9 = element("li");
    			b8 = element("b");
    			b8.textContent = "Text Button:";
    			t50 = text(" Text based button, has visual cues signaling that\r\n\t\t\t\t\t\tit is a clickable element");
    			t51 = space();
    			h43 = element("h4");
    			h43.textContent = "➡️ Styling";
    			t53 = space();
    			ul3 = element("ul");
    			li10 = element("li");
    			b9 = element("b");
    			b9.textContent = "background_color:";
    			t55 = text(" color to be used as the button background, directly\r\n\t\t\t\t\t\tinserted into 'background-color' css property, accepts all the values\r\n\t\t\t\t\t\tthat are valid background colors");
    			t56 = space();
    			li11 = element("li");
    			b10 = element("b");
    			b10.textContent = "text_color:";
    			t58 = text(" color to be used as the button text color, directly\r\n\t\t\t\t\t\tinserted into 'text-color' css property, accepts all the values that\r\n\t\t\t\t\t\tare valid colors");
    			t59 = space();
    			li12 = element("li");
    			b11 = element("b");
    			b11.textContent = "padding:";
    			t61 = text(" button padding, use it as the shorthand css property\r\n\t\t\t\t\t\tfor 'padding'");
    			t62 = space();
    			li13 = element("li");
    			b12 = element("b");
    			b12.textContent = "border:";
    			t64 = text(" button border, use it as the shorthand css property for\r\n\t\t\t\t\t\t'border'");
    			t65 = space();
    			li14 = element("li");
    			b13 = element("b");
    			b13.textContent = "box-shadow:";
    			t67 = text(" button box shadow, use it as the shorthand css property\r\n\t\t\t\t\t\tfor 'box-shadow'");
    			t68 = space();
    			li15 = element("li");
    			b14 = element("b");
    			b14.textContent = "width:";
    			t70 = text(" set a width to be used inside the button, by default it\r\n\t\t\t\t\t\tassumes an 'auto' width, to wrap its contents");
    			t71 = space();
    			div8 = element("div");
    			div6 = element("div");
    			create_component(card.$$.fragment);
    			t72 = space();
    			div7 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Card";
    			t74 = space();
    			h44 = element("h4");
    			h44.textContent = "➡️ Slots";
    			t76 = space();
    			ul4 = element("ul");
    			li16 = element("li");
    			b15 = element("b");
    			b15.textContent = "image:";
    			t78 = text(" place an element with 100% width at the top of the card");
    			t79 = space();
    			li17 = element("li");
    			b16 = element("b");
    			b16.textContent = "title:";
    			t81 = text(" place an element as the title of the card, has increased\r\n\t\t\t\t\t\tfont size and weight");
    			t82 = space();
    			li18 = element("li");
    			b17 = element("b");
    			b17.textContent = "description (default slot):";
    			t84 = text(" place an element without font modifications");
    			t85 = space();
    			li19 = element("li");
    			b18 = element("b");
    			b18.textContent = "action:";
    			t87 = text(" place elements at the bottom of the card, usually interactive\r\n\t\t\t\t\t\telements are placed inside this are");
    			t88 = space();
    			h45 = element("h4");
    			h45.textContent = "➡️ Styling";
    			t90 = space();
    			ul5 = element("ul");
    			li20 = element("li");
    			b19 = element("b");
    			b19.textContent = "background_color:";
    			t92 = text(" color to be used as the card background, directly\r\n\t\t\t\t\t\tinserted into 'background-color' css property, accepts all the values\r\n\t\t\t\t\t\tthat are valid background colors");
    			t93 = space();
    			li21 = element("li");
    			b20 = element("b");
    			b20.textContent = "separator_color:";
    			t95 = text(" color to be used as the separator color, directly\r\n\t\t\t\t\t\tinserted into 'color' css property, accepts all the values that are valid\r\n\t\t\t\t\t\tcolors");
    			t96 = space();
    			li22 = element("li");
    			b21 = element("b");
    			b21.textContent = "separator_color:";
    			t98 = text(" font size to be used for the separator, directly\r\n\t\t\t\t\t\tinserted into 'font-size' css property, accepts all the values that are\r\n\t\t\t\t\t\tvalid font sizes");
    			t99 = space();
    			li23 = element("li");
    			b22 = element("b");
    			b22.textContent = "separator_weight:";
    			t101 = text(" font weight to be used for the separator, directly\r\n\t\t\t\t\t\tinserted into 'font-weight' css property, accepts all the values that\r\n\t\t\t\t\t\tare valid font weight (number | 'bold' | 'nomral' | 'thin' | 'lighter'\r\n\t\t\t\t\t\t| ...)");
    			t102 = space();
    			li24 = element("li");
    			b23 = element("b");
    			b23.textContent = "fade_ratio:";
    			t104 = text(" increasingly decrements opacity when closer to the\r\n\t\t\t\t\t\torigin, must be a number between 0-1, 0 means 'no fading' 1 means only\r\n\t\t\t\t\t\tthe last element shall be visible");
    			t105 = space();
    			div11 = element("div");
    			div9 = element("div");
    			create_component(chip0.$$.fragment);
    			t106 = space();
    			create_component(chip1.$$.fragment);
    			t107 = space();
    			div10 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Chip";
    			t109 = space();
    			h46 = element("h4");
    			h46.textContent = "➡️ Styling";
    			t111 = space();
    			ul6 = element("ul");
    			li25 = element("li");
    			b24 = element("b");
    			b24.textContent = "background_color:";
    			t113 = text(" color to be used as the button background, directly\r\n\t\t\t\t\t\tinserted into 'background-color' css property, accepts all the values\r\n\t\t\t\t\t\tthat are valid background colors");
    			t114 = space();
    			li26 = element("li");
    			b25 = element("b");
    			b25.textContent = "text_color:";
    			t116 = text(" color to be used as the button text color and border\r\n\t\t\t\t\t\tcolor, directly inserted into 'text-color' ans 'border-color' css property,\r\n\t\t\t\t\t\taccepts all the values that are valid colors");
    			t117 = space();
    			li27 = element("li");
    			b26 = element("b");
    			b26.textContent = "padding:";
    			t119 = text(" button padding, use it as the shorthand css property\r\n\t\t\t\t\t\tfor 'padding'");
    			t120 = space();
    			li28 = element("li");
    			b27 = element("b");
    			b27.textContent = "border:";
    			t122 = text(" button border, use it as the shorthand css property for\r\n\t\t\t\t\t\t'border'");
    			t123 = space();
    			li29 = element("li");
    			b28 = element("b");
    			b28.textContent = "width:";
    			t125 = text(" set a width to be used inside the button, by default it\r\n\t\t\t\t\t\tassumes an 'auto' width, to wrap its contents");
    			t126 = space();
    			div14 = element("div");
    			div12 = element("div");
    			create_component(circularframe0.$$.fragment);
    			t127 = space();
    			create_component(circularframe1.$$.fragment);
    			t128 = space();
    			create_component(circularframe2.$$.fragment);
    			t129 = space();
    			create_component(circularframe3.$$.fragment);
    			t130 = space();
    			div13 = element("div");
    			h35 = element("h3");
    			h35.textContent = "Circular Frame";
    			t132 = space();
    			h47 = element("h4");
    			h47.textContent = "➡️ Styling";
    			t134 = space();
    			ul7 = element("ul");
    			li30 = element("li");
    			b29 = element("b");
    			b29.textContent = "background_color:";
    			t136 = text(" color to be used as the button background, directly\r\n\t\t\t\t\t\tinserted into 'background-color' css property, accepts all the values\r\n\t\t\t\t\t\tthat are valid background colors");
    			t137 = space();
    			li31 = element("li");
    			b30 = element("b");
    			b30.textContent = "text_color:";
    			t139 = text(" color to be used as the button text color and border\r\n\t\t\t\t\t\tcolor, directly inserted into 'text-color' ans 'border-color' css property,\r\n\t\t\t\t\t\taccepts all the values that are valid colors");
    			t140 = space();
    			li32 = element("li");
    			b31 = element("b");
    			b31.textContent = "padding:";
    			t142 = text(" button padding, use it as the shorthand css property\r\n\t\t\t\t\t\tfor 'padding'");
    			t143 = space();
    			li33 = element("li");
    			b32 = element("b");
    			b32.textContent = "border:";
    			t145 = text(" button border, use it as the shorthand css property for\r\n\t\t\t\t\t\t'border'");
    			t146 = space();
    			li34 = element("li");
    			b33 = element("b");
    			b33.textContent = "width:";
    			t148 = text(" set a width to be used inside the button, by default it\r\n\t\t\t\t\t\tassumes an 'auto' width, to wrap its contents");
    			t149 = space();
    			div17 = element("div");
    			div15 = element("div");
    			create_component(button1.$$.fragment);
    			t150 = space();
    			create_component(contextmenu.$$.fragment);
    			t151 = space();
    			div16 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Context Menu";
    			t153 = space();
    			h48 = element("h4");
    			h48.textContent = "➡️ Styling";
    			t155 = space();
    			ul8 = element("ul");
    			li35 = element("li");
    			b34 = element("b");
    			b34.textContent = "background_color:";
    			t157 = text(" color to be used as the button background, directly\r\n\t\t\t\t\t\tinserted into 'background-color' css property, accepts all the values\r\n\t\t\t\t\t\tthat are valid background colors");
    			t158 = space();
    			li36 = element("li");
    			b35 = element("b");
    			b35.textContent = "text_color:";
    			t160 = text(" color to be used as the button text color and border\r\n\t\t\t\t\t\tcolor, directly inserted into 'text-color' ans 'border-color' css property,\r\n\t\t\t\t\t\taccepts all the values that are valid colors");
    			t161 = space();
    			li37 = element("li");
    			b36 = element("b");
    			b36.textContent = "padding:";
    			t163 = text(" button padding, use it as the shorthand css property\r\n\t\t\t\t\t\tfor 'padding'");
    			t164 = space();
    			li38 = element("li");
    			b37 = element("b");
    			b37.textContent = "border:";
    			t166 = text(" button border, use it as the shorthand css property for\r\n\t\t\t\t\t\t'border'");
    			t167 = space();
    			li39 = element("li");
    			b38 = element("b");
    			b38.textContent = "width:";
    			t169 = text(" set a width to be used inside the button, by default it\r\n\t\t\t\t\t\tassumes an 'auto' width, to wrap its contents");
    			t170 = space();
    			div18 = element("div");
    			h49 = element("h4");
    			h49.textContent = "Dropdown";
    			t172 = space();
    			div19 = element("div");
    			h410 = element("h4");
    			h410.textContent = "Expandable Container";
    			t174 = space();
    			div20 = element("div");
    			h411 = element("h4");
    			h411.textContent = "Floating Action Button";
    			t176 = space();
    			div21 = element("div");
    			h412 = element("h4");
    			h412.textContent = "Icon Button";
    			t178 = space();
    			div22 = element("div");
    			h413 = element("h4");
    			h413.textContent = "Line Separator";
    			t180 = space();
    			div23 = element("div");
    			h414 = element("h4");
    			h414.textContent = "Popup";
    			t182 = space();
    			div24 = element("div");
    			h415 = element("h4");
    			h415.textContent = "Progress Bar";
    			t184 = space();
    			div25 = element("div");
    			h416 = element("h4");
    			h416.textContent = "Progress Ring";
    			t186 = space();
    			div26 = element("div");
    			h417 = element("h4");
    			h417.textContent = "Resizable Container";
    			t188 = space();
    			div27 = element("div");
    			h418 = element("h4");
    			h418.textContent = "SVG Icon";
    			t190 = space();
    			div28 = element("div");
    			h419 = element("h4");
    			h419.textContent = "Tab";
    			t192 = space();
    			div29 = element("div");
    			h420 = element("h4");
    			h420.textContent = "Tooltip";
    			attr_dev(h1, "class", "svelte-1ysq9vi");
    			add_location(h1, file$1, 81, 1, 2574);
    			attr_dev(h30, "class", "svelte-1ysq9vi");
    			add_location(h30, file$1, 99, 1, 2980);
    			add_location(br0, file$1, 100, 1, 3012);
    			attr_dev(div0, "class", "component-display svelte-1ysq9vi");
    			add_location(div0, file$1, 104, 3, 3111);
    			attr_dev(h31, "class", "svelte-1ysq9vi");
    			add_location(h31, file$1, 117, 4, 3568);
    			add_location(h40, file$1, 118, 4, 3593);
    			attr_dev(li0, "class", "svelte-1ysq9vi");
    			add_location(li0, file$1, 120, 5, 3632);
    			add_location(ul0, file$1, 119, 4, 3621);
    			add_location(h41, file$1, 125, 4, 3756);
    			add_location(b0, file$1, 128, 6, 3804);
    			attr_dev(li1, "class", "svelte-1ysq9vi");
    			add_location(li1, file$1, 127, 5, 3792);
    			add_location(b1, file$1, 133, 6, 4032);
    			attr_dev(li2, "class", "svelte-1ysq9vi");
    			add_location(li2, file$1, 132, 5, 4020);
    			add_location(b2, file$1, 138, 6, 4231);
    			attr_dev(li3, "class", "svelte-1ysq9vi");
    			add_location(li3, file$1, 137, 5, 4219);
    			add_location(b3, file$1, 143, 6, 4437);
    			attr_dev(li4, "class", "svelte-1ysq9vi");
    			add_location(li4, file$1, 142, 5, 4425);
    			add_location(b4, file$1, 149, 6, 4712);
    			attr_dev(li5, "class", "svelte-1ysq9vi");
    			add_location(li5, file$1, 148, 5, 4700);
    			add_location(ul1, file$1, 126, 4, 3781);
    			attr_dev(div1, "class", "component-properties svelte-1ysq9vi");
    			add_location(div1, file$1, 116, 3, 3528);
    			attr_dev(div2, "class", "interface-display svelte-1ysq9vi");
    			add_location(div2, file$1, 103, 2, 3075);
    			add_location(br1, file$1, 163, 4, 5121);
    			attr_dev(div3, "class", "component-display svelte-1ysq9vi");
    			add_location(div3, file$1, 160, 3, 5007);
    			attr_dev(h32, "class", "svelte-1ysq9vi");
    			add_location(h32, file$1, 168, 4, 5276);
    			add_location(h42, file$1, 169, 4, 5297);
    			add_location(b5, file$1, 174, 6, 5498);
    			attr_dev(li6, "class", "svelte-1ysq9vi");
    			add_location(li6, file$1, 173, 5, 5486);
    			add_location(b6, file$1, 178, 6, 5660);
    			attr_dev(li7, "class", "svelte-1ysq9vi");
    			add_location(li7, file$1, 177, 5, 5648);
    			add_location(b7, file$1, 182, 6, 5778);
    			attr_dev(li8, "class", "svelte-1ysq9vi");
    			add_location(li8, file$1, 181, 5, 5766);
    			add_location(b8, file$1, 186, 6, 5902);
    			attr_dev(li9, "class", "svelte-1ysq9vi");
    			add_location(li9, file$1, 185, 5, 5890);
    			add_location(ul2, file$1, 172, 4, 5475);
    			add_location(h43, file$1, 190, 4, 6033);
    			add_location(b9, file$1, 193, 6, 6081);
    			attr_dev(li10, "class", "svelte-1ysq9vi");
    			add_location(li10, file$1, 192, 5, 6069);
    			add_location(b10, file$1, 198, 6, 6305);
    			attr_dev(li11, "class", "svelte-1ysq9vi");
    			add_location(li11, file$1, 197, 5, 6293);
    			add_location(b11, file$1, 203, 6, 6506);
    			attr_dev(li12, "class", "svelte-1ysq9vi");
    			add_location(li12, file$1, 202, 5, 6494);
    			add_location(b12, file$1, 207, 6, 6626);
    			attr_dev(li13, "class", "svelte-1ysq9vi");
    			add_location(li13, file$1, 206, 5, 6614);
    			add_location(b13, file$1, 211, 6, 6743);
    			attr_dev(li14, "class", "svelte-1ysq9vi");
    			add_location(li14, file$1, 210, 5, 6731);
    			add_location(b14, file$1, 215, 6, 6872);
    			attr_dev(li15, "class", "svelte-1ysq9vi");
    			add_location(li15, file$1, 214, 5, 6860);
    			add_location(ul3, file$1, 191, 4, 6058);
    			attr_dev(div4, "class", "component-properties svelte-1ysq9vi");
    			add_location(div4, file$1, 167, 3, 5236);
    			attr_dev(div5, "class", "interface-display svelte-1ysq9vi");
    			add_location(div5, file$1, 159, 2, 4971);
    			attr_dev(div6, "class", "component-display svelte-1ysq9vi");
    			add_location(div6, file$1, 224, 3, 7109);
    			attr_dev(h33, "class", "svelte-1ysq9vi");
    			add_location(h33, file$1, 238, 4, 7547);
    			add_location(h44, file$1, 239, 4, 7566);
    			add_location(b15, file$1, 242, 6, 7612);
    			attr_dev(li16, "class", "svelte-1ysq9vi");
    			add_location(li16, file$1, 241, 5, 7600);
    			add_location(b16, file$1, 245, 6, 7712);
    			attr_dev(li17, "class", "svelte-1ysq9vi");
    			add_location(li17, file$1, 244, 5, 7700);
    			add_location(b17, file$1, 249, 6, 7841);
    			attr_dev(li18, "class", "svelte-1ysq9vi");
    			add_location(li18, file$1, 248, 5, 7829);
    			add_location(b18, file$1, 252, 6, 7950);
    			attr_dev(li19, "class", "svelte-1ysq9vi");
    			add_location(li19, file$1, 251, 5, 7938);
    			add_location(ul4, file$1, 240, 4, 7589);
    			add_location(h45, file$1, 256, 4, 8098);
    			add_location(b19, file$1, 259, 6, 8146);
    			attr_dev(li20, "class", "svelte-1ysq9vi");
    			add_location(li20, file$1, 258, 5, 8134);
    			add_location(b20, file$1, 264, 6, 8368);
    			attr_dev(li21, "class", "svelte-1ysq9vi");
    			add_location(li21, file$1, 263, 5, 8356);
    			add_location(b21, file$1, 269, 6, 8567);
    			attr_dev(li22, "class", "svelte-1ysq9vi");
    			add_location(li22, file$1, 268, 5, 8555);
    			add_location(b22, file$1, 274, 6, 8773);
    			attr_dev(li23, "class", "svelte-1ysq9vi");
    			add_location(li23, file$1, 273, 5, 8761);
    			add_location(b23, file$1, 280, 6, 9048);
    			attr_dev(li24, "class", "svelte-1ysq9vi");
    			add_location(li24, file$1, 279, 5, 9036);
    			add_location(ul5, file$1, 257, 4, 8123);
    			attr_dev(div7, "class", "component-properties svelte-1ysq9vi");
    			add_location(div7, file$1, 237, 3, 7507);
    			attr_dev(div8, "class", "interface-display svelte-1ysq9vi");
    			attr_dev(div8, "name", "card");
    			add_location(div8, file$1, 223, 2, 7061);
    			attr_dev(div9, "class", "component-display svelte-1ysq9vi");
    			add_location(div9, file$1, 290, 3, 9339);
    			attr_dev(h34, "class", "svelte-1ysq9vi");
    			add_location(h34, file$1, 300, 4, 9605);
    			add_location(h46, file$1, 301, 4, 9624);
    			add_location(b24, file$1, 304, 6, 9672);
    			attr_dev(li25, "class", "svelte-1ysq9vi");
    			add_location(li25, file$1, 303, 5, 9660);
    			add_location(b25, file$1, 309, 6, 9896);
    			attr_dev(li26, "class", "svelte-1ysq9vi");
    			add_location(li26, file$1, 308, 5, 9884);
    			add_location(b26, file$1, 314, 6, 10133);
    			attr_dev(li27, "class", "svelte-1ysq9vi");
    			add_location(li27, file$1, 313, 5, 10121);
    			add_location(b27, file$1, 318, 6, 10253);
    			attr_dev(li28, "class", "svelte-1ysq9vi");
    			add_location(li28, file$1, 317, 5, 10241);
    			add_location(b28, file$1, 322, 6, 10370);
    			attr_dev(li29, "class", "svelte-1ysq9vi");
    			add_location(li29, file$1, 321, 5, 10358);
    			add_location(ul6, file$1, 302, 4, 9649);
    			attr_dev(div10, "class", "component-properties svelte-1ysq9vi");
    			add_location(div10, file$1, 299, 3, 9565);
    			attr_dev(div11, "class", "interface-display svelte-1ysq9vi");
    			add_location(div11, file$1, 289, 2, 9303);
    			attr_dev(div12, "class", "component-display svelte-1ysq9vi");
    			add_location(div12, file$1, 331, 3, 10605);
    			attr_dev(h35, "class", "svelte-1ysq9vi");
    			add_location(h35, file$1, 354, 4, 11438);
    			add_location(h47, file$1, 355, 4, 11467);
    			add_location(b29, file$1, 358, 6, 11515);
    			attr_dev(li30, "class", "svelte-1ysq9vi");
    			add_location(li30, file$1, 357, 5, 11503);
    			add_location(b30, file$1, 363, 6, 11739);
    			attr_dev(li31, "class", "svelte-1ysq9vi");
    			add_location(li31, file$1, 362, 5, 11727);
    			add_location(b31, file$1, 368, 6, 11976);
    			attr_dev(li32, "class", "svelte-1ysq9vi");
    			add_location(li32, file$1, 367, 5, 11964);
    			add_location(b32, file$1, 372, 6, 12096);
    			attr_dev(li33, "class", "svelte-1ysq9vi");
    			add_location(li33, file$1, 371, 5, 12084);
    			add_location(b33, file$1, 376, 6, 12213);
    			attr_dev(li34, "class", "svelte-1ysq9vi");
    			add_location(li34, file$1, 375, 5, 12201);
    			add_location(ul7, file$1, 356, 4, 11492);
    			attr_dev(div13, "class", "component-properties svelte-1ysq9vi");
    			add_location(div13, file$1, 353, 3, 11398);
    			attr_dev(div14, "class", "interface-display svelte-1ysq9vi");
    			add_location(div14, file$1, 330, 2, 10569);
    			attr_dev(div15, "class", "component-display svelte-1ysq9vi");
    			add_location(div15, file$1, 385, 3, 12445);
    			attr_dev(h36, "class", "svelte-1ysq9vi");
    			add_location(h36, file$1, 395, 4, 12744);
    			add_location(h48, file$1, 396, 4, 12771);
    			add_location(b34, file$1, 399, 6, 12819);
    			attr_dev(li35, "class", "svelte-1ysq9vi");
    			add_location(li35, file$1, 398, 5, 12807);
    			add_location(b35, file$1, 404, 6, 13043);
    			attr_dev(li36, "class", "svelte-1ysq9vi");
    			add_location(li36, file$1, 403, 5, 13031);
    			add_location(b36, file$1, 409, 6, 13280);
    			attr_dev(li37, "class", "svelte-1ysq9vi");
    			add_location(li37, file$1, 408, 5, 13268);
    			add_location(b37, file$1, 413, 6, 13400);
    			attr_dev(li38, "class", "svelte-1ysq9vi");
    			add_location(li38, file$1, 412, 5, 13388);
    			add_location(b38, file$1, 417, 6, 13517);
    			attr_dev(li39, "class", "svelte-1ysq9vi");
    			add_location(li39, file$1, 416, 5, 13505);
    			add_location(ul8, file$1, 397, 4, 12796);
    			attr_dev(div16, "class", "component-properties svelte-1ysq9vi");
    			add_location(div16, file$1, 394, 3, 12704);
    			attr_dev(div17, "class", "interface-display svelte-1ysq9vi");
    			add_location(div17, file$1, 384, 2, 12409);
    			add_location(h49, file$1, 423, 7, 13692);
    			attr_dev(div18, "class", "svelte-1ysq9vi");
    			add_location(div18, file$1, 423, 2, 13687);
    			add_location(h410, file$1, 424, 7, 13724);
    			attr_dev(div19, "class", "svelte-1ysq9vi");
    			add_location(div19, file$1, 424, 2, 13719);
    			add_location(h411, file$1, 425, 7, 13768);
    			attr_dev(div20, "class", "svelte-1ysq9vi");
    			add_location(div20, file$1, 425, 2, 13763);
    			add_location(h412, file$1, 426, 7, 13814);
    			attr_dev(div21, "class", "svelte-1ysq9vi");
    			add_location(div21, file$1, 426, 2, 13809);
    			add_location(h413, file$1, 427, 7, 13849);
    			attr_dev(div22, "class", "svelte-1ysq9vi");
    			add_location(div22, file$1, 427, 2, 13844);
    			add_location(h414, file$1, 428, 7, 13887);
    			attr_dev(div23, "class", "svelte-1ysq9vi");
    			add_location(div23, file$1, 428, 2, 13882);
    			add_location(h415, file$1, 429, 7, 13916);
    			attr_dev(div24, "class", "svelte-1ysq9vi");
    			add_location(div24, file$1, 429, 2, 13911);
    			add_location(h416, file$1, 430, 7, 13952);
    			attr_dev(div25, "class", "svelte-1ysq9vi");
    			add_location(div25, file$1, 430, 2, 13947);
    			add_location(h417, file$1, 431, 7, 13989);
    			attr_dev(div26, "class", "svelte-1ysq9vi");
    			add_location(div26, file$1, 431, 2, 13984);
    			add_location(h418, file$1, 432, 7, 14032);
    			attr_dev(div27, "class", "svelte-1ysq9vi");
    			add_location(div27, file$1, 432, 2, 14027);
    			add_location(h419, file$1, 433, 7, 14064);
    			attr_dev(div28, "class", "svelte-1ysq9vi");
    			add_location(div28, file$1, 433, 2, 14059);
    			add_location(h420, file$1, 434, 7, 14091);
    			attr_dev(div29, "class", "svelte-1ysq9vi");
    			add_location(div29, file$1, 434, 2, 14086);
    			attr_dev(sector, "class", "components svelte-1ysq9vi");
    			add_location(sector, file$1, 101, 1, 3021);
    			attr_dev(div30, "class", "svelte-1ysq9vi");
    			add_location(div30, file$1, 80, 0, 2550);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div30, anchor);
    			append_dev(div30, h1);
    			mount_component(iconbutton, h1, null);
    			mount_component(svgicon, h1, null);
    			append_dev(h1, t0);
    			append_dev(div30, t1);
    			mount_component(dimmedbutton0, div30, null);
    			append_dev(div30, t2);
    			mount_component(lineseparator, div30, null);
    			append_dev(div30, t3);
    			append_dev(div30, h30);
    			append_dev(div30, t5);
    			append_dev(div30, br0);
    			append_dev(div30, t6);
    			append_dev(div30, sector);
    			append_dev(sector, div2);
    			append_dev(div2, div0);
    			mount_component(breadcrumb, div0, null);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, h31);
    			append_dev(div1, t9);
    			append_dev(div1, h40);
    			append_dev(div1, t11);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(div1, t13);
    			append_dev(div1, h41);
    			append_dev(div1, t15);
    			append_dev(div1, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, b0);
    			append_dev(li1, t17);
    			append_dev(ul1, t18);
    			append_dev(ul1, li2);
    			append_dev(li2, b1);
    			append_dev(li2, t20);
    			append_dev(ul1, t21);
    			append_dev(ul1, li3);
    			append_dev(li3, b2);
    			append_dev(li3, t23);
    			append_dev(ul1, t24);
    			append_dev(ul1, li4);
    			append_dev(li4, b3);
    			append_dev(li4, t26);
    			append_dev(ul1, t27);
    			append_dev(ul1, li5);
    			append_dev(li5, b4);
    			append_dev(li5, t29);
    			append_dev(sector, t30);
    			append_dev(sector, div5);
    			append_dev(div5, div3);
    			mount_component(button0, div3, null);
    			append_dev(div3, t31);
    			mount_component(dimmedbutton1, div3, null);
    			append_dev(div3, t32);
    			append_dev(div3, br1);
    			append_dev(div3, t33);
    			mount_component(outlinebutton, div3, null);
    			append_dev(div3, t34);
    			mount_component(textbutton, div3, null);
    			append_dev(div5, t35);
    			append_dev(div5, div4);
    			append_dev(div4, h32);
    			append_dev(div4, t37);
    			append_dev(div4, h42);
    			append_dev(div4, t39);
    			append_dev(div4, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, b5);
    			append_dev(li6, t41);
    			append_dev(ul2, t42);
    			append_dev(ul2, li7);
    			append_dev(li7, b6);
    			append_dev(li7, t44);
    			append_dev(ul2, t45);
    			append_dev(ul2, li8);
    			append_dev(li8, b7);
    			append_dev(li8, t47);
    			append_dev(ul2, t48);
    			append_dev(ul2, li9);
    			append_dev(li9, b8);
    			append_dev(li9, t50);
    			append_dev(div4, t51);
    			append_dev(div4, h43);
    			append_dev(div4, t53);
    			append_dev(div4, ul3);
    			append_dev(ul3, li10);
    			append_dev(li10, b9);
    			append_dev(li10, t55);
    			append_dev(ul3, t56);
    			append_dev(ul3, li11);
    			append_dev(li11, b10);
    			append_dev(li11, t58);
    			append_dev(ul3, t59);
    			append_dev(ul3, li12);
    			append_dev(li12, b11);
    			append_dev(li12, t61);
    			append_dev(ul3, t62);
    			append_dev(ul3, li13);
    			append_dev(li13, b12);
    			append_dev(li13, t64);
    			append_dev(ul3, t65);
    			append_dev(ul3, li14);
    			append_dev(li14, b13);
    			append_dev(li14, t67);
    			append_dev(ul3, t68);
    			append_dev(ul3, li15);
    			append_dev(li15, b14);
    			append_dev(li15, t70);
    			append_dev(sector, t71);
    			append_dev(sector, div8);
    			append_dev(div8, div6);
    			mount_component(card, div6, null);
    			append_dev(div8, t72);
    			append_dev(div8, div7);
    			append_dev(div7, h33);
    			append_dev(div7, t74);
    			append_dev(div7, h44);
    			append_dev(div7, t76);
    			append_dev(div7, ul4);
    			append_dev(ul4, li16);
    			append_dev(li16, b15);
    			append_dev(li16, t78);
    			append_dev(ul4, t79);
    			append_dev(ul4, li17);
    			append_dev(li17, b16);
    			append_dev(li17, t81);
    			append_dev(ul4, t82);
    			append_dev(ul4, li18);
    			append_dev(li18, b17);
    			append_dev(li18, t84);
    			append_dev(ul4, t85);
    			append_dev(ul4, li19);
    			append_dev(li19, b18);
    			append_dev(li19, t87);
    			append_dev(div7, t88);
    			append_dev(div7, h45);
    			append_dev(div7, t90);
    			append_dev(div7, ul5);
    			append_dev(ul5, li20);
    			append_dev(li20, b19);
    			append_dev(li20, t92);
    			append_dev(ul5, t93);
    			append_dev(ul5, li21);
    			append_dev(li21, b20);
    			append_dev(li21, t95);
    			append_dev(ul5, t96);
    			append_dev(ul5, li22);
    			append_dev(li22, b21);
    			append_dev(li22, t98);
    			append_dev(ul5, t99);
    			append_dev(ul5, li23);
    			append_dev(li23, b22);
    			append_dev(li23, t101);
    			append_dev(ul5, t102);
    			append_dev(ul5, li24);
    			append_dev(li24, b23);
    			append_dev(li24, t104);
    			append_dev(sector, t105);
    			append_dev(sector, div11);
    			append_dev(div11, div9);
    			mount_component(chip0, div9, null);
    			append_dev(div9, t106);
    			mount_component(chip1, div9, null);
    			append_dev(div11, t107);
    			append_dev(div11, div10);
    			append_dev(div10, h34);
    			append_dev(div10, t109);
    			append_dev(div10, h46);
    			append_dev(div10, t111);
    			append_dev(div10, ul6);
    			append_dev(ul6, li25);
    			append_dev(li25, b24);
    			append_dev(li25, t113);
    			append_dev(ul6, t114);
    			append_dev(ul6, li26);
    			append_dev(li26, b25);
    			append_dev(li26, t116);
    			append_dev(ul6, t117);
    			append_dev(ul6, li27);
    			append_dev(li27, b26);
    			append_dev(li27, t119);
    			append_dev(ul6, t120);
    			append_dev(ul6, li28);
    			append_dev(li28, b27);
    			append_dev(li28, t122);
    			append_dev(ul6, t123);
    			append_dev(ul6, li29);
    			append_dev(li29, b28);
    			append_dev(li29, t125);
    			append_dev(sector, t126);
    			append_dev(sector, div14);
    			append_dev(div14, div12);
    			mount_component(circularframe0, div12, null);
    			append_dev(div12, t127);
    			mount_component(circularframe1, div12, null);
    			append_dev(div12, t128);
    			mount_component(circularframe2, div12, null);
    			append_dev(div12, t129);
    			mount_component(circularframe3, div12, null);
    			append_dev(div14, t130);
    			append_dev(div14, div13);
    			append_dev(div13, h35);
    			append_dev(div13, t132);
    			append_dev(div13, h47);
    			append_dev(div13, t134);
    			append_dev(div13, ul7);
    			append_dev(ul7, li30);
    			append_dev(li30, b29);
    			append_dev(li30, t136);
    			append_dev(ul7, t137);
    			append_dev(ul7, li31);
    			append_dev(li31, b30);
    			append_dev(li31, t139);
    			append_dev(ul7, t140);
    			append_dev(ul7, li32);
    			append_dev(li32, b31);
    			append_dev(li32, t142);
    			append_dev(ul7, t143);
    			append_dev(ul7, li33);
    			append_dev(li33, b32);
    			append_dev(li33, t145);
    			append_dev(ul7, t146);
    			append_dev(ul7, li34);
    			append_dev(li34, b33);
    			append_dev(li34, t148);
    			append_dev(sector, t149);
    			append_dev(sector, div17);
    			append_dev(div17, div15);
    			mount_component(button1, div15, null);
    			append_dev(div15, t150);
    			mount_component(contextmenu, div15, null);
    			append_dev(div17, t151);
    			append_dev(div17, div16);
    			append_dev(div16, h36);
    			append_dev(div16, t153);
    			append_dev(div16, h48);
    			append_dev(div16, t155);
    			append_dev(div16, ul8);
    			append_dev(ul8, li35);
    			append_dev(li35, b34);
    			append_dev(li35, t157);
    			append_dev(ul8, t158);
    			append_dev(ul8, li36);
    			append_dev(li36, b35);
    			append_dev(li36, t160);
    			append_dev(ul8, t161);
    			append_dev(ul8, li37);
    			append_dev(li37, b36);
    			append_dev(li37, t163);
    			append_dev(ul8, t164);
    			append_dev(ul8, li38);
    			append_dev(li38, b37);
    			append_dev(li38, t166);
    			append_dev(ul8, t167);
    			append_dev(ul8, li39);
    			append_dev(li39, b38);
    			append_dev(li39, t169);
    			append_dev(sector, t170);
    			append_dev(sector, div18);
    			append_dev(div18, h49);
    			append_dev(sector, t172);
    			append_dev(sector, div19);
    			append_dev(div19, h410);
    			append_dev(sector, t174);
    			append_dev(sector, div20);
    			append_dev(div20, h411);
    			append_dev(sector, t176);
    			append_dev(sector, div21);
    			append_dev(div21, h412);
    			append_dev(sector, t178);
    			append_dev(sector, div22);
    			append_dev(div22, h413);
    			append_dev(sector, t180);
    			append_dev(sector, div23);
    			append_dev(div23, h414);
    			append_dev(sector, t182);
    			append_dev(sector, div24);
    			append_dev(div24, h415);
    			append_dev(sector, t184);
    			append_dev(sector, div25);
    			append_dev(div25, h416);
    			append_dev(sector, t186);
    			append_dev(sector, div26);
    			append_dev(div26, h417);
    			append_dev(sector, t188);
    			append_dev(sector, div27);
    			append_dev(div27, h418);
    			append_dev(sector, t190);
    			append_dev(sector, div28);
    			append_dev(div28, h419);
    			append_dev(sector, t192);
    			append_dev(sector, div29);
    			append_dev(div29, h420);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dimmedbutton0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				dimmedbutton0_changes.$$scope = { dirty, ctx };
    			}

    			dimmedbutton0.$set(dimmedbutton0_changes);
    			const breadcrumb_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				breadcrumb_changes.$$scope = { dirty, ctx };
    			}

    			breadcrumb.$set(breadcrumb_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const dimmedbutton1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				dimmedbutton1_changes.$$scope = { dirty, ctx };
    			}

    			dimmedbutton1.$set(dimmedbutton1_changes);
    			const outlinebutton_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				outlinebutton_changes.$$scope = { dirty, ctx };
    			}

    			outlinebutton.$set(outlinebutton_changes);
    			const textbutton_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				textbutton_changes.$$scope = { dirty, ctx };
    			}

    			textbutton.$set(textbutton_changes);
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    			const chip0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				chip0_changes.$$scope = { dirty, ctx };
    			}

    			chip0.$set(chip0_changes);
    			const chip1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				chip1_changes.$$scope = { dirty, ctx };
    			}

    			chip1.$set(chip1_changes);
    			const circularframe0_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				circularframe0_changes.$$scope = { dirty, ctx };
    			}

    			circularframe0.$set(circularframe0_changes);
    			const circularframe1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				circularframe1_changes.$$scope = { dirty, ctx };
    			}

    			circularframe1.$set(circularframe1_changes);
    			const circularframe2_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				circularframe2_changes.$$scope = { dirty, ctx };
    			}

    			circularframe2.$set(circularframe2_changes);
    			const circularframe3_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				circularframe3_changes.$$scope = { dirty, ctx };
    			}

    			circularframe3.$set(circularframe3_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const contextmenu_changes = {};

    			if (!updating_visible && dirty & /*cmVisibility*/ 1) {
    				updating_visible = true;
    				contextmenu_changes.visible = /*cmVisibility*/ ctx[0];
    				add_flush_callback(() => updating_visible = false);
    			}

    			if (!updating_position && dirty & /*cmPosition*/ 2) {
    				updating_position = true;
    				contextmenu_changes.position = /*cmPosition*/ ctx[1];
    				add_flush_callback(() => updating_position = false);
    			}

    			contextmenu.$set(contextmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			transition_in(svgicon.$$.fragment, local);
    			transition_in(dimmedbutton0.$$.fragment, local);
    			transition_in(lineseparator.$$.fragment, local);
    			transition_in(breadcrumb.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(dimmedbutton1.$$.fragment, local);
    			transition_in(outlinebutton.$$.fragment, local);
    			transition_in(textbutton.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			transition_in(chip0.$$.fragment, local);
    			transition_in(chip1.$$.fragment, local);
    			transition_in(circularframe0.$$.fragment, local);
    			transition_in(circularframe1.$$.fragment, local);
    			transition_in(circularframe2.$$.fragment, local);
    			transition_in(circularframe3.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(contextmenu.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div30_transition) div30_transition = create_bidirectional_transition(div30, fade, {}, true);
    				div30_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			transition_out(svgicon.$$.fragment, local);
    			transition_out(dimmedbutton0.$$.fragment, local);
    			transition_out(lineseparator.$$.fragment, local);
    			transition_out(breadcrumb.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(dimmedbutton1.$$.fragment, local);
    			transition_out(outlinebutton.$$.fragment, local);
    			transition_out(textbutton.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			transition_out(chip0.$$.fragment, local);
    			transition_out(chip1.$$.fragment, local);
    			transition_out(circularframe0.$$.fragment, local);
    			transition_out(circularframe1.$$.fragment, local);
    			transition_out(circularframe2.$$.fragment, local);
    			transition_out(circularframe3.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(contextmenu.$$.fragment, local);
    			if (!div30_transition) div30_transition = create_bidirectional_transition(div30, fade, {}, false);
    			div30_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div30);
    			destroy_component(iconbutton);
    			destroy_component(svgicon);
    			destroy_component(dimmedbutton0);
    			destroy_component(lineseparator);
    			destroy_component(breadcrumb);
    			destroy_component(button0);
    			destroy_component(dimmedbutton1);
    			destroy_component(outlinebutton);
    			destroy_component(textbutton);
    			destroy_component(card);
    			destroy_component(chip0);
    			destroy_component(chip1);
    			destroy_component(circularframe0);
    			destroy_component(circularframe1);
    			destroy_component(circularframe2);
    			destroy_component(circularframe3);
    			destroy_component(button1);
    			destroy_component(contextmenu);
    			if (detaching && div30_transition) div30_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $CurrentTheme;
    	validate_store(CurrentTheme, "CurrentTheme");
    	component_subscribe($$self, CurrentTheme, $$value => $$invalidate(2, $CurrentTheme = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UIKit", slots, []);
    	

    	const CMItems = [
    		{
    			icon: "/img/icons/menu.svg",
    			title: "Click Me",
    			onClick() {
    				alert("clicked me!");
    			}
    		},
    		{
    			title: "NO! Click Me",
    			onClick() {
    				alert("clicked me!");
    			}
    		},
    		{
    			title: "Tou cannot click me ",
    			enabled: false,
    			onClick() {
    				console.log("oopsie");
    			}
    		},
    		{
    			title: "Im a submenu",
    			spawn_submenu: true,
    			items: [
    				{
    					icon: "/img/icons/menu.svg",
    					title: "Click Me",
    					onClick() {
    						alert("clicked me!");
    					}
    				}
    			]
    		},
    		{
    			title: "im a group!",
    			items: [
    				{
    					icon: "/img/icons/menu.svg",
    					title: "Click Me",
    					onClick() {
    						alert("clicked me!");
    					}
    				}
    			]
    		}
    	];

    	let cmVisibility = false;
    	let cmPosition = { x: "0", y: "0" };

    	function openContextMenu(ev) {
    		ev.preventDefault();

    		$$invalidate(1, cmPosition = {
    			x: ev.clientX + "px",
    			y: ev.clientY + "px"
    		});

    		$$invalidate(0, cmVisibility = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<UIKit> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		window.history.go(-1);
    	};

    	const click_handler_1 = () => {
    		if ($CurrentTheme.name === "light") {
    			set_store_value(CurrentTheme, $CurrentTheme = DarkTheme, $CurrentTheme);
    		} else {
    			set_store_value(CurrentTheme, $CurrentTheme = LightInterfaceTheme, $CurrentTheme);
    		}
    	};

    	function contextmenu_visible_binding(value) {
    		cmVisibility = value;
    		$$invalidate(0, cmVisibility);
    	}

    	function contextmenu_position_binding(value) {
    		cmPosition = value;
    		$$invalidate(1, cmPosition);
    	}

    	$$self.$capture_state = () => ({
    		Breadcrumb,
    		BreadcrumbItem,
    		Button,
    		DimmedButton,
    		OutlineButton,
    		TextButton,
    		Card,
    		IconButton,
    		LineSeparator,
    		SvgIcon: SVGIcon,
    		CurrentTheme,
    		DarkTheme,
    		LightInterfaceTheme,
    		fade,
    		Chip,
    		CircularFrame,
    		ContextMenu,
    		CMItems,
    		cmVisibility,
    		cmPosition,
    		openContextMenu,
    		$CurrentTheme
    	});

    	$$self.$inject_state = $$props => {
    		if ("cmVisibility" in $$props) $$invalidate(0, cmVisibility = $$props.cmVisibility);
    		if ("cmPosition" in $$props) $$invalidate(1, cmPosition = $$props.cmPosition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cmVisibility,
    		cmPosition,
    		$CurrentTheme,
    		CMItems,
    		openContextMenu,
    		click_handler,
    		click_handler_1,
    		contextmenu_visible_binding,
    		contextmenu_position_binding
    	];
    }

    class UIKit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UIKit",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const UIKitRoute = {
        url_pattern: 'about',
        onActivation: DisplayRoutedComponent(UIKit)
    };
    const NotAboutRoute = {
        url_pattern: 'not-about',
        onActivation: DisplayRoutedComponent(LandingPage)
    };

    const LandingRoute = {
        url_pattern: '',
        onActivation: DisplayRoutedComponent(LandingPage)
    };

    const SubRoute = {
        url_pattern: 'subroute',
        async onActivation() {
        }
    };

    // # - Routes barrel !

    var Routes = /*#__PURE__*/Object.freeze({
        __proto__: null,
        UIKitRoute: UIKitRoute,
        NotAboutRoute: NotAboutRoute,
        LandingRoute: LandingRoute,
        SubRoute: SubRoute
    });

    /* src\pages\not_found\RouteNotFound.svelte generated by Svelte v3.37.0 */
    const file = "src\\pages\\not_found\\RouteNotFound.svelte";

    // (44:4) <DimmedButton>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Go home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(44:4) <DimmedButton>",
    		ctx
    	});

    	return block;
    }

    // (43:2) <Link href="/">
    function create_default_slot(ctx) {
    	let dimmedbutton;
    	let current;

    	dimmedbutton = new DimmedButton({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dimmedbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dimmedbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dimmedbutton_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				dimmedbutton_changes.$$scope = { dirty, ctx };
    			}

    			dimmedbutton.$set(dimmedbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dimmedbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dimmedbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dimmedbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(43:2) <Link href=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let svgicon;
    	let t2;
    	let h2;
    	let t4;
    	let h4;
    	let t5;
    	let i;
    	let t6;
    	let t7_value = /*$CurrentRoute*/ ctx[0].url + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let h3;
    	let t12;
    	let icontextbutton;
    	let t13;
    	let link;
    	let div_transition;
    	let current;

    	svgicon = new SVGIcon({
    			props: {
    				src: "/img/icons/not.found.svg",
    				styles: {
    					size: "30vh",
    					color: "var(--secondary-color-50)"
    				}
    			},
    			$$inline: true
    		});

    	icontextbutton = new IconTextButton({
    			props: {
    				icon_src: "/img/icons/back.svg",
    				text: "Go Back"
    			},
    			$$inline: true
    		});

    	icontextbutton.$on("click", /*click_handler*/ ctx[1]);

    	link = new Link({
    			props: {
    				href: "/",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Ermm, where are we?";
    			t1 = space();
    			create_component(svgicon.$$.fragment);
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Could not find the page you're looking for :(";
    			t4 = space();
    			h4 = element("h4");
    			t5 = text("The url ");
    			i = element("i");
    			t6 = text("'");
    			t7 = text(t7_value);
    			t8 = text("'");
    			t9 = text(" is not defined anywhere, but it's okay,\r\n    we all lose our way sometimes");
    			t10 = space();
    			h3 = element("h3");
    			h3.textContent = "Here, see if these help:";
    			t12 = space();
    			create_component(icontextbutton.$$.fragment);
    			t13 = text("\r\n  or\r\n  ");
    			create_component(link.$$.fragment);
    			attr_dev(h1, "class", "svelte-1aij17e");
    			add_location(h1, file, 23, 2, 661);
    			add_location(h2, file, 28, 2, 814);
    			add_location(i, file, 30, 12, 890);
    			attr_dev(h4, "class", "svelte-1aij17e");
    			add_location(h4, file, 29, 2, 872);
    			add_location(h3, file, 33, 2, 1006);
    			attr_dev(div, "class", "page svelte-1aij17e");
    			add_location(div, file, 22, 0, 623);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			mount_component(svgicon, div, null);
    			append_dev(div, t2);
    			append_dev(div, h2);
    			append_dev(div, t4);
    			append_dev(div, h4);
    			append_dev(h4, t5);
    			append_dev(h4, i);
    			append_dev(i, t6);
    			append_dev(i, t7);
    			append_dev(i, t8);
    			append_dev(h4, t9);
    			append_dev(div, t10);
    			append_dev(div, h3);
    			append_dev(div, t12);
    			mount_component(icontextbutton, div, null);
    			append_dev(div, t13);
    			mount_component(link, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$CurrentRoute*/ 1) && t7_value !== (t7_value = /*$CurrentRoute*/ ctx[0].url + "")) set_data_dev(t7, t7_value);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgicon.$$.fragment, local);
    			transition_in(icontextbutton.$$.fragment, local);
    			transition_in(link.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgicon.$$.fragment, local);
    			transition_out(icontextbutton.$$.fragment, local);
    			transition_out(link.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(svgicon);
    			destroy_component(icontextbutton);
    			destroy_component(link);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $CurrentRoute;
    	validate_store(CurrentRoute$1, "CurrentRoute");
    	component_subscribe($$self, CurrentRoute$1, $$value => $$invalidate(0, $CurrentRoute = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RouteNotFound", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RouteNotFound> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		window.history.go(-1);
    	};

    	$$self.$capture_state = () => ({
    		DimmedButton,
    		IconTextButton,
    		Link,
    		SvgIcon: SVGIcon,
    		CurrentRoute: CurrentRoute$1,
    		fade,
    		$CurrentRoute
    	});

    	return [$CurrentRoute, click_handler];
    }

    class RouteNotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RouteNotFound",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    AppRouter.setStrategy(new HistoryApiStrategy);
    AppRouter.addRoute(...Object.entries(Routes).map(([_, r]) => r));
    AppRouter.routeNotFound = (url) => {
        CurrentRoute$1.set({
            visibleComponent: RouteNotFound,
            componentProperties: { url },
            url: url,
            queryParams: {},
            urlParams: {},
            state: 'route-not-found'
        });
    };
    AppRouter.start();
    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=app.bundle.js.map
