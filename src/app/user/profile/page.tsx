import { PageStack } from '@/components/custom/PageStack';
import { ProfileAccountSection, ProfileBottomSection, ProfileMiddleSection, ProfileTopSection } from './_sections';

export default function ProfilePage() {
  return (
    <PageStack>
      <ProfileTopSection />
      <ProfileMiddleSection />
      <ProfileBottomSection />
      <ProfileAccountSection />
    </PageStack>
  );
}
