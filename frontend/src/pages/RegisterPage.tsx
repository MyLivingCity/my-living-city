import RegisterPageContent from '../components/content/RegisterPageContent'
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useUserRoles from '../hooks/useUserRoles';

export default function RegisterPage() {

  // Fetch User Roles
  const { data, error, isLoading } = useUserRoles();

  if (isLoading) {
    return (
      <div className="wrapper">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="wrapper">
      <RegisterPageContent userRoles={ data }/>
    </div>
  )
}
