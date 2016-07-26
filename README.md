# Bluegreen

Example API proxy that retrieves a JSON payload describing weights and targets, and then balances load among them.

This proxy does not actually balance load to backend systems.  The demonstration for that would be a little complicated. Instead, what it does is demonstrate how to perform the weighted random selection of a target.

To actually do weighted load balancing, you'd need to follow that up with:

1. Setting up the various targets and weights is left as an exercise for the reader.

2. at runtime, setting the context variable 'target.url' with the value of the dynamically-selected target URL. 





