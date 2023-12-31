import { throttleByKey } from "./throttle.js";

const isHtmlElem = (elem) => {
	return elem && typeof elem === "object" && "tagName" in elem || false;
}
const stack = new Map();
const setVars = (elem, prefix, { width, height }) => {
	if (width !== undefined) elem.style.setProperty(`--${prefix}width`, width);
	if (height !== undefined) elem.style.setProperty(`--${prefix}height`, height);
};
const handleResize = throttleByKey((target) => {
	if (!stack.has(target)) return;
	const { elem, prefix, container, include } = stack.get(target);
	const holder = isHtmlElem(container) ? container : elem;
	const vars = {
		width: elem.clientWidth,
		height: elem.clientHeight,
	};
	if (include !== undefined && include !== null) {
		if (!include.includes("height")) delete vars.height;
		if (!include.includes("width")) delete vars.width;
	}
	setVars(holder, prefix, vars);
}, 100, { noLeadingCall: true });
const observer = new ResizeObserver((entries) => {
	entries.forEach(({ target }) => {
		handleResize(target, target);
	});
});
const registerElem = (elem, { prefix, container, include }) => { // prefix, containerElemOrSelector
	const normalizedPrefix = prefix ? `${prefix}-` : "";
	const containerElem = isHtmlElem(container) ? container : elem.closest(container);
	stack.set(elem, { elem, prefix: normalizedPrefix, container: containerElem, include });
	observer.observe(elem);
}
export const trackBlockSize = (target, options) => { // { prefix, container, include }
	if (typeof target === "string") {
		const elems = document.querySelectorAll(target);
		elems.forEach(elem => registerElem(elem, options));
	} else {
		registerElem(target, options);
	}
};
export const initBlockSizeTracking = () => { // { prefix, container, include }
	const elems = document.querySelectorAll("[data-track-size]");

	elems.forEach(elem => {
		registerElem(elem, {
			prefix: elem.getAttribute("data-track-size"),
			container: elem.getAttribute("data-size-vars-container"),
			include: elem.getAttribute("data-include-size-vars")
		});
	});
};