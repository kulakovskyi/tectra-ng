A pretend server answers 503 twice, then 200. `retryHttpReads` waits longer before every new try; a 404 fails at once. Short delays here so you can watch it.
