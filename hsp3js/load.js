var Module = {
	print: (text => {
		const op = document.getElementById('output');
		if (op) op.value = '';
		return text => {
			if (text) {
				console.log(text);
				if (op) {
					op.value += text + '\n';
					op.scrollTop = op.scrollHeight;
				}
			}
		};
	})(),
	printErr (text) {
		if (text) console.error(text);
	},
	canvas: (()=> {
		const cv = document.getElementById('canvas');
		cv.addEventListener("webglcontextlost", e => {
			alert('WebGL context lost. You will need to reload the page.');
			e.preventDefault();
		}, false);
		cv.hidden = true;
		return cv;
	})(),
	setStatus (text) {
		if (text) {
			if (!this.pretext) this.pretext = '';
			if (text === this.pretext) return;
			this.pretext = text;
			console.log(text);
			document.getElementById('status').innerHTML = text;
		}
	},
	preRun () {
		let cnt = 0;
		const dirs = [];
		const preload = f => {
			const idx = f.lastIndexOf('/');
			if (idx > 0) {
				const d = f.slice(0, idx);
				if (dirs.indexOf(d) < 0) {
					dirs.push(d);
					FS.mkdir(d);
				}
			}
			FS.createPreloadedFile(f, '', `${DIR_PREDATA}/${f}`, true, false, ()=> {
				cnt++;
				Module.setStatus(`Loading... (${cnt}/${PRELOAD_FILES.length+1})`);
			});
		};
		preload(AX_FILE);
		for (const f of PRELOAD_FILES) {
			preload(f);
		}
		ENV = JSON.parse(DISH_ENV);
	},
	postRun () {
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('status').style.display = 'none';
		Module.canvas.hidden = false;
		window.dispatchEvent(new Event('resize'));
	},
	noAudioDecoding: true,
	arguments: [AX_FILE]
};

Module.setStatus('Loading...');

if (RESIZABLE) window.onresize = ()=> {
	const c = Module.canvas;
	c.style.top = '50%';
	c.style.left = '50%';
	c.style.transform = 'translate(-50%,-50%)' +
		`scale(${Math.min(window.innerWidth / c.width, window.innerHeight / c.height)})`;
};

window.onerror = ()=> {
	Module.setStatus('Exception thrown, see JavaScript console');
	document.getElementById('spinner').setAttribute('style','animation-play-state:paused;');
	Module.setStatus = text => {
		if (text) Module.printErr('[post-exception status] ' + text);
	};
};
