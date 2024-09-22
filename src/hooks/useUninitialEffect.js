import { useRef, useEffect } from 'react'

export function useUninitialEffect(effect, deps) {
	const initialRender = useRef(true)

	useEffect(() => {

		if (initialRender.current)
			initialRender.current = false
		else
			return effect()

	}, deps)
}

