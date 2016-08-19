# Apigee Edge enables Blue/Green routing

This is an example API proxy that shoes how to distribute load to multiple back end systems, based on
a weighted-random selection algorithm.

This technique is sometimes called a "blue/green" deployment. The idea is described in
some detail
[here](https://cloudnative.io/blog/2015/02/the-dos-and-donts-of-bluegreen-deployment/).
In brief: there is one version of the backend, the "blue" version, that is running along
just fine, and carrying all the load.  Then, after a development cycle, there's a new
revision of the backend system, a "green" version, that needs to get deployed. The only
way to know whether it will work properly under load is to apply load to it.  But, to
manage the risk, ideally there ought to be a way to start by directing only some small
portion of load to the green version, and evaluate its performance. If things go
smoothly, then adjust the portion of load going to green a little higher.  And so
on. Until eventually, the load going to green is 100% and the load to blue is 0%, and we
can de-commission the blue version of the server.

This Apigee Edge proxy retrieves a JSON payload describing weights and targets, and then
balances load among them.  The list of targets and weights is cached, and periodically
re-fetched, to allow an administrator to change those settings, and have the API Proxy
change its routing behavior.

## In further detail

There's nothing really exotic going on here. The key pieces of the system are:

- the list of targets and their weights. You can think of this as a "registry" of
  targets.  If you want the weights to all be the same - so that all targets get an
  equal share of the load, no problem. This list must be accessible to the API Proxy.
  Putting it into a usergrid / BaaS collection is a great way to do that. It doesn't
  have to be usergrid, though. It could be a Key-Value Map, or it could be some other
  external service or registry.  All we need is a list of tuples of {target, weight}.

- Some Javascript logic that applies a weighted-random selection to that list. 

The proxy caches the list of tuples for 10 seconds. This means weights get adjusted on
that interval. Decreasing the TTL of the cache means the proxy will read the list more
often, and change more dyamically.  Since the weights are retrieved synchronously with
respect to a request, this will have an time impact on one of the requests within the
TTL window. If you adjust the TTL to a higher value - say 60 seconds - then the changes
will be detected more slowly, and the time impact to reload the cache occurs less
frequently.


## Possible Enhancements

A simple enhancement would be to refresh the cache of {target, weight} tuples asynchronously with respect to any request.
That ought to be easy to do, using Nodejs. You could use the same Weighted Random Selector object in Javascript.  Just use setTimeout() to
refresh the cache periodically. 

But I think of this as a YAGNI thing. It might be nice to have, but you probably aren't gonna need it. 


## Notes

This proxy does not actually balance load to *any* backend systems. Instead it is a pure
loopback proxy, which responds without connecting to anything on the backend. Rather
than demonstrate actual load balancing, which would be a little complicated, what this
proxy does is demonstrate how to perform the weighted random selection of a target.

You should think of this as just a building block.  It will compose nicely with Token verification, caching, quota enforcement, and even Shared Flows. 


To actually do weighted load balancing, you'd need to follow that up with:

1. Administratively setting up the various targets and weights. And adjusting them as appropriate. 

2. Adding an AssignMessage step in the target flow to set the context variable 'target.url' with the value of the dynamically-selected target URL. 

3. Directing client load through the system.



