
```js
if (req.user.role !== roles[0] || req.user.role !== roles)
```
The above is wrong because:
role = "admin":       false && true  → false → allowed  ✓
role = "maintainer":  true && false  → false → allowed  ✓
role = "viewer":      true && true   → true  → denied   ✓

instead use this:
```js
   if (req.user.role !== roles[0] && req.user.role !== roles[1])
```

![alt text](1786309872513488698.png)

the issue above was caused because the patch request had a title deconstructed and in a case where title isnt passed then the whole thing fails because slugify would fail because undefined can run a `toLowerCase()` method. So we have to make a check that tells the code to only run slugify when title is given.