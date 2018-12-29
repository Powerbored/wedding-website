export default function(document, file) {
	let script = document.createElement('script');
	script.setAttribute('src', file);
	document.head.appendChild(script);
}
