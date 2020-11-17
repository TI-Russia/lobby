define([], function(){
return function ShowedClusters(clusters,k, isSF) {
        //first five largest clusters in each group
        var groups = [11550, 11593, 11679, 11727, 11739, null]
        var showedClustersNumbers = []
        var showedClusters
        var scale = k
        var slice
        if (scale <= 1) slice = 5
        if (scale > 1) slice = 8
        if (scale > 1.3) slice = 10
        if (scale > 2.1) slice = 20
        if (scale > 3.7) slice = 30

        groups.forEach(group => {
            if (group===11727 && isSF && scale <= 1.6) {
                    slice = 1;
            }
            showedClustersNumbers = showedClustersNumbers.concat(clusters
                .filter(x => x.clusterParent == group)
                .sort((a, b) => b.count - a.count)
                .slice(0, slice)
                .map(x => x.cluster))
        })

        showedClusters = clusters.filter(x => showedClustersNumbers.includes(x.cluster))
        return showedClusters
    }
});