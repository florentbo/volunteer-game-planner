import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  AppServices,
  ParentProfile,
  ProfileService,
  Session,
} from './services/types'

const e164PhonePattern = /^\+[1-9]\d{7,14}$/

type AppProps = {
  services: AppServices
}

export default function App({ services }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate services={services} />
    </QueryClientProvider>
  )
}

function AuthGate({ services }: AppProps) {
  const [session, setSession] = useState<Session | null | undefined>()
  const queryClient = useQueryClient()

  useEffect(() => {
    let currentUserId: string | undefined
    return services.auth.subscribe((nextSession) => {
      if (nextSession?.userId !== currentUserId || nextSession === null) {
        queryClient.clear()
      }
      currentUserId = nextSession?.userId
      setSession(nextSession)
    })
  }, [services.auth, queryClient])

  if (session === undefined) {
    return <StatusPanel message="Vérification de votre session…" />
  }

  if (session === null) {
    return (
      <LoginFlow
        requestOtp={services.auth.requestOtp}
        verifyOtp={services.auth.verifyOtp}
      />
    )
  }

  return (
    <ProfileScreen
      onSignOut={services.auth.signOut}
      profiles={services.profiles}
      session={session}
    />
  )
}

type LoginFlowProps = {
  requestOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, token: string) => Promise<void>
}

function LoginFlow({ requestOtp, verifyOtp }: LoginFlowProps) {
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)

    const normalizedPhone = phone.trim()
    if (!e164PhonePattern.test(normalizedPhone)) {
      setError('Utilisez le format international, par exemple +32470000001.')
      return
    }

    setSubmitting(true)

    try {
      await requestOtp(normalizedPhone)
      setPhone(normalizedPhone)
      setStep('code')
    } catch {
      setError(
        "Impossible d'envoyer le code. Vérifiez votre numéro et réessayez.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    setSubmitting(true)

    try {
      await verifyOtp(phone, token)
    } catch {
      setError('Code incorrect ou expiré. Vérifiez le code et réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      {step === 'phone' ? (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            void handlePhoneSubmit(event)
          }}
        >
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              U11G-1
            </p>
            <h1 className="text-3xl font-bold text-slate-950">
              Connexion parent
            </h1>
            <p className="text-slate-600">
              Utilisez le numéro enregistré auprès de l'équipe.
            </p>
          </header>

          <label className="block space-y-2 text-left font-medium text-slate-800">
            <span>Numéro de téléphone</span>
            <input
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              inputMode="tel"
              name="phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+32470000001"
              required
              type="tel"
              value={phone}
            />
          </label>

          {error ? <ErrorMessage>{error}</ErrorMessage> : null}

          <button
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Envoi…' : 'Recevoir le code'}
          </button>
        </form>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            void handleCodeSubmit(event)
          }}
        >
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-950">
              Entrez votre code
            </h1>
            <p className="text-slate-600">
              Le code à six chiffres a été demandé pour {phone}.
            </p>
          </header>

          <label className="block space-y-2 text-left font-medium text-slate-800">
            <span>Code à six chiffres</span>
            <input
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setToken(event.target.value)}
              pattern="[0-9]{6}"
              required
              value={token}
            />
          </label>

          {error ? <ErrorMessage>{error}</ErrorMessage> : null}

          <button
            className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Vérification…' : 'Se connecter'}
          </button>
        </form>
      )}
    </PageShell>
  )
}

function ProfileScreen({
  onSignOut,
  profiles,
  session,
}: {
  onSignOut: () => Promise<void>
  profiles: ProfileService
  session: Session
}) {
  const profile = useQuery({
    queryKey: ['parent-profile', session.userId],
    queryFn: () => profiles.getCurrent(session.userId),
  })

  if (profile.isPending) {
    return <StatusPanel message="Chargement de votre profil…" />
  }

  if (profile.isError) {
    return (
      <PageShell>
        <section className="space-y-4">
          <ErrorMessage>
            Impossible de charger votre profil. Réessayez dans un instant.
          </ErrorMessage>
          <button
            className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800"
            onClick={() => {
              void profile.refetch()
            }}
            type="button"
          >
            Réessayer
          </button>
        </section>
      </PageShell>
    )
  }

  return <ProfileCard onSignOut={onSignOut} profile={profile.data} />
}

function ProfileCard({
  onSignOut,
  profile,
}: {
  onSignOut: () => Promise<void>
  profile: ParentProfile
}) {
  const [signOutError, setSignOutError] = useState(false)

  async function handleSignOut() {
    setSignOutError(false)
    try {
      await onSignOut()
    } catch {
      setSignOutError(true)
    }
  }

  return (
    <PageShell>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Votre profil
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Bonjour {profile.parentName}
          </h1>
        </header>

        <div className="rounded-2xl bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-950">
            {profile.children.length > 1 ? 'Enfants' : 'Enfant'}
          </h2>
          {profile.children.length > 0 ? (
            <ul className="mt-2 space-y-1 text-emerald-900">
              {profile.children.map((child, index) => (
                <li key={index}>{child}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-emerald-900">Aucun enfant enregistré</p>
          )}
        </div>

        <button
          className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
          onClick={() => {
            void handleSignOut()
          }}
          type="button"
        >
          Se déconnecter
        </button>
        {signOutError ? (
          <ErrorMessage>
            Impossible de vous déconnecter. Réessayez dans un instant.
          </ErrorMessage>
        ) : null}
      </section>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-7 shadow-xl shadow-emerald-950/10 sm:p-9">
        {children}
      </div>
    </main>
  )
}

function StatusPanel({ message }: { message: string }) {
  return (
    <PageShell>
      <p aria-live="polite" className="text-center font-medium text-slate-700">
        {message}
      </p>
    </PageShell>
  )
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
      {children}
    </p>
  )
}
