define(['d3'], function (d3) {

    const s = 500;
    const donutRadius = 30;
    let half = 0;
    let deps = [];
    let groups = [];

    const sdHexagon = (point) => {
        let x = point.x;
        let y = point.y;
        let r = 0; // radius
        let k = {x: -0.866025404, y: 0.5, z: 0.577350269};
        x = Math.abs(x);
        y = Math.abs(y);

        let dot = 2 * Math.min(k.x * x + k.y * y, 0);

        x -= dot * k.x;
        y -= dot * k.y;

        let clampX = x;
        clampX < -k.z * r ? -k.z * r : clampX;
        clampX > k.z * r ? k.z * r : clampX;
        x -= clampX;
        y -= r;
        return Math.sqrt(x * x + y * y) * Math.sign(y);
    }

    const decartToPolar = (decart) => {
        let alpha = Math.atan2(decart.x, decart.y) + Math.PI;
        let R = Math.sqrt(decart.x * decart.x + decart.y * decart.y);
        return {x: alpha, y: R};
    }

    const polarToDecart = (polar) => {
        let alpha = polar.x;
        let R = polar.y;
        let x = Math.sin(alpha) * R;
        let y = Math.cos(alpha) * R;
        return {x: x, y: y};
    }

    const sdNgon = (point, N) => {
        let pol = decartToPolar(point)
        let step = 2. * 3.1415 / N
        pol.x = (pol.x % step) - 3.14 / N
        let point2 = polarToDecart(pol)
        return point2.y
    }

    const rotate = (point, a) => {
        let {x, y} = point;
        let x2 = x * Math.cos(a) - y * Math.sin(a);
        let y2 = x * Math.sin(a) + y * Math.cos(a);
        return {x: x2, y: y2}
    }

    const distance = (point) => {
        let x = point.x, y = point.y;
        let distance;
        x += y / 2;
        y *= Math.sqrt(3) / 2;
        distance = (x * x + y * y) + Math.atan2(point.x, point.y) * .001;
        if (half) {
            distance -= donutRadius ** 2;
            distance = Math.abs(distance);
            if (y > .5) distance = Infinity;
        }
        return distance;
    }

    const getNeighbours = (point) => {
        const dist = 5;
        let neighbors = [
            {x: point.x - dist, y: point.y - 0},
            {x: point.x + dist, y: point.y - 0},
            {x: point.x - 0, y: point.y - dist},
            {x: point.x - 0, y: point.y + dist},
        ]
        return neighbors;
    }

    const pushNeighbour = (stack, n) => {
        n.dist = distance(n);
        let i;
        for (i = 0; i < stack.length; i++) {
            if (n.dist < stack[i].dist) {
                stack.splice(i, 0, n);
                break;
            }
        }
        if (i == stack.length)
            stack.push(n);
    }

    function X(dist, center) {
        this.dist = dist;
        this.center = center;
        this.data = [];
        this.stack = [{x: 0, y: 0, dist: 0}];
        if (half) {
            this.stack[0].x = -donutRadius - 1;
        }

        this.getPoint = (i) => {
            while (this.data.length <= i && this.stack.length > 0) {
                let current = this.stack.shift();
                let neighbours = getNeighbours(current);
                neighbours = neighbours.filter(n => {
                    let match = false
                    this.data.forEach(d => {
                        if (d.x == n.x && d.y == n.y) {
                            match = true;
                        }
                    })
                    this.stack.forEach(d => {
                        if (d.x == n.x && d.y == n.y) {
                            match = true;
                        }
                    })
                    return !match;
                })
                neighbours.forEach(n => {
                    pushNeighbour(this.stack, n);
                })
                current.transformed = this.transform(current);
                this.data.push(current);
            }
            return this.data[i].transformed
        }
        this.transform = (point) => {
            let x = point.x;
            let y = point.y;
            x += y / 2;
            y *= Math.sqrt(3) / 2;
            x *= this.dist;
            y *= this.dist;
            x += this.center.x;
            y += this.center.y;
            return {x: x, y: y};
        }
    }

    const slides = [];
    slides[0] = [1];
    slides[1] = [1, 11851];
    slides[2] = [11593, 11551, 11739, 11701, 11696, 11697, 11710,11720,11562,11717,11683,11698,11589,11713];
    slides[3] = [11593, 11551, 11739, 11720, 11701, 11696, 11697,11710,/*11720,*/11562,11683,11698];
    slides[4] = [11551, 11724, 11573, 11703, 11552, 11699, 11760, 11758, 11809, 11783];

    const groupsNames={
        11593:	'Регионы',
        11551:	'Силовики',
        11739:	'Крупный бизнес и госкорпорации',
        11701:	'Строительство, девелопмент',
        11696:	'Сельское хозяйство',
        11697:	'Лесное, рыбное хозяйство',
        11710:	'Здравоохранение',
        11720:	'Госуправление',
        11562:	'ФОИВы',
        11717:	'Финансы, банки',
        11683:	'Топливная промышленность',
        11698:	'Транспорт и связь',
        11589:	'Банк России',
        11713:	'Образование и наука',
        11724:	'Адвокаты',
        11573:	'Роскомнадзор',
        11703:	'Телекоммуникации, IT',
        11552:	'ФСБ',
        11699:	'транспорт',
        11760:	'ОАО РЖД',
        11758:	'ГК Ростех',
        11809:	'ГК Росатом',
        11783:	'АО ОСК',
        1: '',
        11851: ''
    }

    const coords=[];
    const labelCoords = [];
    const width = 600;
    const el = d3.select('#scrollytelling').node().getBoundingClientRect();
    const height = width / (el.width/el.height);
    const rowsBySlide = {
        0:1,
        1:2,
        2:4,
        3:4,
        4:4,
        5:4
    };

    slides.forEach((slide,i) => {
        slide.forEach((group,j) => {
            const row = +rowsBySlide[i];
            const h = height-row*20;
            const startX = (j % row) * width/row + width/row/2;
            const startY = (j - j % row)/row *(h/row+30) + h/row/2+10;
            const center1={
                x: startX,
                y: startY+10
            }
            const center2 ={
                x: width/2,
                y: height/2
            }

            const center = (i===0) ? center2 : center1;
            coords[i] = coords[i] ? coords[i] : [];
            coords[i][group] = new X(1.5,center);
            labelCoords[i] = labelCoords[i] ? labelCoords[i] : [];
            labelCoords[i][group]= center;
        })
    });

/*    const color = d3.scaleOrdinal(d3.schemeAccent );
    color.domain(allGroupsExisted);*/
    function setDeps(depsData){
        deps = depsData;
    }
    function setGroups (groupsData){
        groups = groupsData;
    }
    function setHalf (b){
        half = b;
    }

    const updater = (state) => {
        console.log('slide ', state)
        const allDepsInSlide = [];
        const labelsInSlide = [];
        slides[state].forEach(group => {
            let depsInGroup = deps.filter(d => d.clusterMin === group || d.clusterParentMiddle === group || d.clusterParent === group)
            if (state === 0){
                depsInGroup = deps;
            }
            if (state === 1 && group === 1) {
                const neViyavleno = 11851;
                depsInGroup = deps.filter(d => d.clusterMin !== neViyavleno)
            }
            //console.log('в группе ', group , depsInGroup);
            const gr = groupsNames[group];
            const groupName = gr ? gr : ''
            labelsInSlide.push({
                x: labelCoords[state][group].x,
                y: labelCoords[state][group].y - height/rowsBySlide[state]/2,
                text: groupName
            });
            for (let i=0,j=-1; i<depsInGroup.length; i++){
                const d = depsInGroup[i];

                if (d.dupelganger){
                    let  original = deps.find(e => e.id === d.id && e.dupelganger===0)
                    let original2 = depsInGroup.find(e => e.id === d.id && e.uniq!==d.uniq && d.uniq>e.uniq)
                    if (original2) {
                        original = original2;
                    }
                    if (!(original && (original.clusterMin === group || original.clusterParentMiddle === group || original.clusterParent === group))
                        ){
                        j++;
                    if (state === 0 || state === 1){
                        j--;
                    }
                    }

                }else {
                    j++;
                }

                const localCoords = coords[state][group].getPoint(j);
                allDepsInSlide.push({
                    x: localCoords.x,
                    y: localCoords.y,
                    color: 'purple',
                    id: d.id,
                    name: d.name,
                    unq: d.uniq,
                    group: group
                })
            }
            /*depsInGroup.forEach((d,i) => {
                const localCoords = coords[state][group].getPoint(i);
                //allDepsInSlide[group] = allDepsInSlide[group]  ? allDepsInSlide[group] : [];
                allDepsInSlide.push({
                    x: localCoords.x,
                    y: localCoords.y,
                    color: 'purple',
                    id: d.id,
                    name: d.name,
                    unq: ''+d.id+' '+group+'',

                })
            })*/
        })

        return {deps: allDepsInSlide, labels: labelsInSlide}
    }



    return {
        updater: updater,
        setDeps: setDeps,
        setGroups: setGroups,
        setHalf: setHalf,
    };
})