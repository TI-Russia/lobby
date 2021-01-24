define([], function() {


    function list_to_tree(list) {
        var map = {}, node, roots = [], i;
        for (i = 0; i < list.length; i += 1) {
            map[list[i].id] = i; // initialize the map
            list[i].children = []; // initialize the children
        }
        for (i = 0; i < list.length; i += 1) {
            node = list[i];
            if (node.parent !== "0") {
                // if you have dangling branches check that map[node.parent] exists
                list[map[node.parent]].children.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    }

    function tree_to_collection(tree, key, collection,m_array) {
        if (!tree[key] || tree[key].length === 0) return;
        for (var i=0; i < tree[key].length; i++) {
            var child = tree[key][i]
            collection[child.id] = child;
            m_array.push(child)
            tree_to_collection(child, key, collection,m_array);
        }
        return;
    }


    function findAncestors(nodeId, lookup) {
        var ancestors = [nodeId]
        var group = lookup.find(x => x.id === nodeId)
        var parentId = group && group.parent
        while (parentId !== 1 && parentId != undefined) {
            ancestors.unshift(parentId)
            parentId = lookup.find(x => x.id == parentId).parent
        }
        return ancestors;
    }


return {
    list_to_tree: list_to_tree,
    tree_to_collection: tree_to_collection,
    findAncestors:findAncestors
};
});