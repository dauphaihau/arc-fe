export type UndefinableFields<T, Fields> = {
  [K in keyof T]: K extends Fields
    ? T[K] | undefined
    : T[K]
}

export type Override<T extends object, K extends { [P in keyof T]?: any }> = Omit<T, keyof K> & K
