import BlogPostForm from '../../../components/BlogPostForm'

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return <BlogPostForm postId={id} />
}