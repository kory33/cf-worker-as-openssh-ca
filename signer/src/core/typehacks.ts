/**
 * If S extends each union component of T, return T, otherwise return never.
 * 
 * See: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
 */
type UnUnion<T, S> = T extends S ? ([S] extends [T] ? T : never) : never;

/**
 * If T is a finite union of more than one types, return the union of
 * union-components in T which is extended by S.
 * 
 * How this works: If T is a union (T1 | T2 | ... | Tn), then the
 * top-level conditional in UnUnion<T, S> distributes over T and becomes
 * ([S] extends [T1] ? T1 : never) | ... | ([S] extends [Tn] ? Tn : never).
 * 
 * Credit: https://stackoverflow.com/a/70731144
 */
type NotFiniteUnion<T> = UnUnion<T, T>;

/**
 * If T is a literal string type then T, otherwise never.
 *
 * This only works for finite union type T
 * (https://stackoverflow.com/questions/60185084/typescript-enforce-a-type-to-be-string-literal-and-not-string#comment127256202_70731144).
 * For example, LiteralStringOrNever<`a${string}`> evaluates to `a${string}`.
 */
export type LiteralStringOrNever<T extends string> =
  string extends T
  ? never /* T == String */
  : NotFiniteUnion<T> /* T is some union of string */;
