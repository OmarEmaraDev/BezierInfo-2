setup() {
    const curve = this.curve = Bezier.defaultCubic(this);
    curve.points[2].x = 210;
    setMovable(curve.points);
}

draw() {
  resetTransform();
  clear();
  const dim = this.height;
  const curve = this.curve;
  curve.drawSkeleton();
  curve.drawCurve();
  curve.drawPoints();

  translate(dim, 0);
  setStroke(`black`);
  line(0,0,0,dim);

  scale(0.8, 0.9);
  translate(40,20);
  drawAxes(`t`, 0, 1, `X`, 0, dim, dim, dim);

  this.plotDimension(dim, new Bezier(this, curve.points.map((p,i) => ({
    x: (i/3) * dim,
    y: p.x
  }))));

  resetTransform();
  translate(2*dim, 0);
  setStroke(`black`);
  line(0,0,0,dim);

  scale(0.8, 0.9);
  translate(40,20);
  drawAxes(`t`, 0,1, `Y`, 0, dim, dim, dim);

  this.plotDimension(dim, new Bezier(this, curve.points.map((p,i) => ({
    x: (i/3) * dim,
    y: p.y
  }))));
}

plotDimension(dim, dimension) {
    cacheStyle();
    dimension.drawCurve();

    setFill(`red`);
    setStroke(`red`);

    // There are four possible extrema: t=0, t=1, and
    // up to two t values that solves B'(t)=0, provided
    // that they lie between 0 and 1. But of those four,
    // only two will be real extrema (one minimum value,
    // and one maximum value)

    // First we compute the "simple" cases:
    let t1 = 0; let y1 = dimension.get(t1).y;
    let t2 = 1; let y2 = dimension.get(t2).y;

    // We assume y1 < y2, but is that actually true?
    let reverse = (y2 < y1);

    // Are there a solution for B'(t) = 0?
    let roots = this.getRoots(...dimension.dpoints[0].map(p => p.y));

    roots.forEach(t =>{
        // Is that solution a value in [0,1]?
        if (t > 0 && t < 1) {
            // It is, so we have either a new minimum value
            // or new maximum value:
            let dp = dimension.get(t);
            if (reverse) {
                if (dp.y < y2) { t2 = t; y2 = dp.y; }
                if (dp.y > y1) { t1 = t; y1 = dp.y; }
            } else {
                if (dp.y < y1) { t1 = t; y1 = dp.y; }
                if (dp.y > y2) { t2 = t; y2 = dp.y; }
            }
        }
    });

    // Done, show our derivative-based extrema:
    circle(t1 * dim, y1, 3);
    text(`t = ${t1.toFixed(2)}`, map(t1, 0,1, 15,dim-15), y1 + 25);
    circle(t2 * dim, y2, 3);
    text(`t = ${t2.toFixed(2)}`, map(t2, 0,1, 15,dim-15), y2 + 25);

    // And then show the second derivate inflection, if there is one
    setFill(`purple`);
    setStroke(`purple`);
    this.getRoots(...dimension.dpoints[1].map(p => p.y)).forEach(t =>{
        if (t > 0 && t < 1) {
          let d = dimension.get(t);
          circle(t * dim, d.y, 3);
          text(`t = ${t.toFixed(2)}`, map(t, 0,1, 15,dim-15), d.y + 25);
        }
    });

    restoreStyle();
}

getRoots(v1, v2, v3) {
    if (v3 === undefined) {
      return [-v1 / (v2 - v1)];
    }

    const a = v1 - 2*v2 + v3,
        b = 2 * (v2 - v1),
        c = v1,
        d = b*b - 4*a*c;
    if (a === 0) return [];
    if (d < 0) return [];
    const f = -b / (2*a);
    if (d === 0) return [f]
    const l = sqrt(d) / (2*a);
    return [f-l, f+l];
}

onMouseMove() {
  redraw();
}
